import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';
import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { RewardRequestDto } from '@lib/dtos/reward-request/reward-request.dto';
import { UserRoleType } from '@lib/enums';
import { EventConditionType } from '@lib/enums/event-condition-type-enum';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { AuthActant } from '@lib/types/actant.type';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../event/event.service';
import { Event } from '../event/schemas/event.schema';
import { RewardService } from '../reward/reward.service';
import { RpcExceptionUtil } from '@lib/utils/rpc-exception.util';
import {
  RewardRequest,
  RewardRequestDocument,
} from './schemas/reward-request.schema';
import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum copy';
import { UserActivityDto } from '@lib/dtos/user-activity/user-activity.dto';
import { UserActivityType } from '@lib/enums/user-activity-type-enum';

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name)
    private rewardRequestModel: Model<RewardRequestDocument>,
    @Inject(MicroServiceType.AUTH_SERVER) private authClient: ClientProxy,
    private readonly eventService: EventService,
    private readonly rewardService: RewardService,
  ) {}

  async paginateRewardRequests(req: {
    actant: AuthActant;
    paginateRewardRequestsRequestDto: PaginateRewardRequestsRequestDto;
  }): Promise<PaginateRewardRequestsResponseDto> {
    const { actant, paginateRewardRequestsRequestDto } = req;

    const {
      page = 1,
      rpp = 10,
      eventId,
      statuses,
      userId,
    } = paginateRewardRequestsRequestDto;

    const filter: FilterQuery<RewardRequestDocument> = {};

    if (actant.user.role === UserRoleType.USER) {
      filter.userId = actant.user.id;
    } else if (userId) {
      // NOTE 특정 유저의 요청을 관리자/운영자/감사자가 조회하는 경우
      filter.userId = userId;
    }

    if (eventId) {
      filter.eventId = eventId;
    }

    if (statuses && statuses.length > 0) {
      filter.status = { $in: statuses };
    }

    const skip = (page - 1) * rpp;
    const rewardRequests = await this.rewardRequestModel
      .find(filter)
      .sort({ id: -1 })
      .skip(skip)
      .limit(rpp)
      .populate('userId', 'name email')
      .populate('eventId', 'title');
    const total = await this.rewardRequestModel.countDocuments(filter);
    const items = rewardRequests.map((request) =>
      plainToInstance(RewardRequestDto, request),
    );

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async getRewardRequestById(req: {
    actant: AuthActant;
    id: string;
  }): Promise<GetRewardRequestByIdResponseDto> {
    const { actant, id } = req;

    const rewardRequest = await this.rewardRequestModel
      .findById(id)
      .populate('userId', 'name email')
      .populate('eventId')
      .populate('rewards.rewardId');

    if (!rewardRequest) {
      throw RpcExceptionUtil.notFound(
        `보상 요청을 찾을 수 없습니다 (ID: ${id})`,
        'REWARD_REQUEST_NOT_FOUND',
      );
    }

    // USER 권한의 경우 본인 요청만 조회 가능
    if (
      actant.user.role === UserRoleType.USER &&
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      rewardRequest.userId.toString() !== actant.user.id
    ) {
      throw RpcExceptionUtil.forbidden(
        '본인이 신청한 보상 요청만 조회할 수 있습니다',
        'PERMISSION_DENIED',
      );
    }

    return plainToInstance(GetRewardRequestByIdResponseDto, rewardRequest);
  }

  async createEventRewardRequest(req: {
    actant: AuthActant;
    id: string;
    createEventRewardRequestDto: CreateEventRewardRequestResponseDto;
  }): Promise<CreateEventRewardRequestResponseDto> {
    const { actant, id } = req;

    const eventDto = await this.eventService.getEventById({ id });
    const event = plainToInstance(Event, eventDto);

    if (!event) {
      throw RpcExceptionUtil.notFound(
        `이벤트를 찾을 수 없습니다 (ID: ${id})`,
        'EVENT_NOT_FOUND',
      );
    }

    if (event.status === EventStatusType.INACTIVE) {
      throw RpcExceptionUtil.badRequest(
        `이벤트가 비활성 상태입니다 (ID: ${id})`,
        'EVENT_INACTIVE',
      );
    }

    const now = new Date();

    if (event.startDate > now) {
      throw RpcExceptionUtil.badRequest(
        `이벤트가 아직 시작되지 않았습니다 (ID: ${id})`,
        'EVENT_NOT_STARTED',
      );
    }

    if (event.endDate < now) {
      throw RpcExceptionUtil.badRequest(
        `이벤트가 이미 종료되었습니다 (ID: ${id})`,
        'EVENT_ALREADY_ENDED',
      );
    }

    const existingRequest = await this.rewardRequestModel.findOne({
      userId: actant.user.id,
      eventId: id,
    });

    if (existingRequest) {
      throw RpcExceptionUtil.conflict(
        `이미 해당 이벤트에 대한 보상 요청이 존재합니다 (ID: ${id})`,
        'REWARD_REQUEST_ALREADY_EXISTS',
      );
    }

    const rewardRequest = await this.rewardRequestModel.create({
      userId: actant.user.id,
      eventId: id,
      isRewardable: false,
      status: RewardRequestStatusType.REQUESTED,
      rewards: [],
      requestedAt: now,
    });

    // MSA call

    let failReason: string | null = null;

    const userActivities = await (async () => {
      try {
        const { userActivities } = await this.getUserActivitiesRpc(
          actant.user.id,
        );

        return userActivities;
      } catch (error) {
        failReason = error.message;
        return [];
      }
    })();

    const isRewardable = this.getQualificationData(event, userActivities);

    if (isRewardable) {
      const rewards = await this.rewardService.getRewardsByEventId({
        eventId: id,
      });

      const rewardRequestData = rewards.map((reward) => ({
        rewardId: reward._id,
        type: reward.type,
        quantity: reward.quantity,
        itemId: reward.itemId,
        description: reward.description,
        delivered: false,
        deliveredAt: now,
      }));

      await this.rewardRequestModel.updateOne(
        { _id: rewardRequest._id },
        {
          isRewardable,
          status: RewardRequestStatusType.SUCCESS,
          rewards: rewardRequestData,
        },
      );
    } else {
      await this.rewardRequestModel.updateOne(
        { _id: rewardRequest._id },
        {
          isRewardable,
          status: RewardRequestStatusType.FAILED,
          failReason: failReason || 'Qualification not met',
        },
      );
    }

    return plainToInstance(CreateEventRewardRequestResponseDto, rewardRequest, {
      excludeExtraneousValues: true,
      enableCircularCheck: true,
    });
  }

  private getQualificationData(
    event: Event,
    userActivities: UserActivityDto[],
  ): boolean {
    return event.conditions.every((condition) => {
      switch (condition.type) {
        case EventConditionType.USER_INVITE: {
          const inviteActivities = userActivities.filter(
            (act) => act.type === UserActivityType.USER_INVITE,
          );

          return inviteActivities.length >= Number(condition.value);
        }
        case EventConditionType.LOGIN_CONSECUTIVE_DAYS: {
          const loginDays = userActivities
            .filter((act) => act.type === UserActivityType.LOGIN)
            .map((act) => new Date(act.createdAt).toISOString().split('T')[0]); // TODO: userActivity 타입 지정후 로직 개선

          const uniqueDays = [...new Set(loginDays)].sort();

          // 연속된 날짜 계산
          let maxConsecutiveDays = 0;
          let currentConsecutiveDays = 1;

          for (let i = 1; i < uniqueDays.length; i++) {
            const date1 = new Date(uniqueDays[i - 1]);
            const date2 = new Date(uniqueDays[i]);

            // 하루 차이인지 확인
            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              currentConsecutiveDays++;
            } else {
              // 연속이 끊겼으므로 최대값 업데이트 후 초기화
              maxConsecutiveDays = Math.max(
                maxConsecutiveDays,
                currentConsecutiveDays,
              );
              currentConsecutiveDays = 1;
            }
          }

          // 마지막 연속 일수도 확인
          maxConsecutiveDays = Math.max(
            maxConsecutiveDays,
            currentConsecutiveDays,
          );

          const isRewardable = maxConsecutiveDays >= Number(condition.value);

          return isRewardable;
        }
        case EventConditionType.LOGIN_AT: {
          const loginAtDate = new Date(condition.value)
            .toISOString()
            .split('T')[0];
          const loginAtCount = userActivities.filter(
            (act) =>
              act.type === UserActivityType.LOGIN &&
              new Date(act.createdAt).toISOString().split('T')[0] ===
                loginAtDate,
          ).length;

          return loginAtCount > 0;
        }
        case EventConditionType.QUEST_CLEAR_COUNT: {
          const questClearCount = userActivities.filter(
            (act) => act.type === UserActivityType.QUEST_CLEAR_COUNT,
          ).length;

          return questClearCount >= Number(condition.value);
        }
        case EventConditionType.QUEST_CLEAR_SPECIFIC: {
          const questClearCount = userActivities.filter(
            (act) =>
              act.type === UserActivityType.QUEST_CLEAR_SPECIFIC &&
              act.value === condition.value,
          ).length;

          return questClearCount > 0;
        }
        default:
          throw RpcExceptionUtil.badRequest(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `알 수 없는 조건 유형입니다: ${condition.type}`,
            'UNKNOWN_CONDITION_TYPE',
          );
      }
    });
  }

  private async getUserActivitiesRpc(
    userId: string,
  ): Promise<{ userActivities: UserActivityDto[] }> {
    try {
      return await firstValueFrom(
        this.authClient.send('user_activity_get_user_activities', { userId }),
      );
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return { userActivities: [] }; // 기본값으로 빈 배열 반환
    }
  }
}
