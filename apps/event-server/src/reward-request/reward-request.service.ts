import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { CreateEventRewardRequestResponseDto } from '@lib/dtos/event/create-event-reward-request.dto';
import { EventDto } from '@lib/dtos/event/event.dto';
import { GetRewardRequestSummaryByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import {
  RewardRequestDto,
  RewardRequestSummaryDto,
  RewardTransactionDto,
} from '@lib/dtos/reward-request/reward-request.dto';
import { UserActivityDto } from '@lib/dtos/user-activity/user-activity.dto';
import { UserRoleType } from '@lib/enums';
import { EventConditionType } from '@lib/enums/event-condition-type-enum';
import { EventStatusType } from '@lib/enums/event-status-type.enum';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { RewardRequestStatusType } from '@lib/enums/reward-request-status-type.enum copy';
import { RewardTransactionStatusType } from '@lib/enums/reward-transaction-status-type.enum';
import { UserActivityType } from '@lib/enums/user-activity-type-enum';
import { AuthActant } from '@lib/types/actant.type';
import { QuestClearMetadata } from '@lib/types/activity-metadata.type';
import {
  LoginBetweenMetadata,
  LoginConsecutiveMetadata,
  QuestClearCountMetadata,
  QuestClearSpecificMetadata,
  UserInviteMetadata,
} from '@lib/types/condition-metadata.type';
import { RpcExceptionUtil } from '@lib/utils/rpc-exception.util';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import * as dayjs from 'dayjs';
import { FilterQuery, Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../event/event.service';
import {
  RewardRequest,
  RewardRequestDocument,
} from './schemas/reward-request.schema';
import { UserDto } from '@lib/dtos/user/user.dto';

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name)
    private rewardRequestModel: Model<RewardRequestDocument>,
    @Inject(MicroServiceType.AUTH_SERVER) private authClient: ClientProxy,
    private readonly eventService: EventService,
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
      // NOTE 특정 유저의 요청을 ADMIN/OPERATOR/AUDITOR 가 조회하는 경우
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
      .limit(rpp);
    const total = await this.rewardRequestModel.countDocuments(filter);

    const items = rewardRequests.map((request) =>
      plainToInstance(RewardRequestDto, request),
    );

    return PaginationResponseDto.create(items, total, page, rpp);
  }

  async getRewardRequestSummaryById(req: {
    actant: AuthActant;
    id: string;
  }): Promise<GetRewardRequestSummaryByIdResponseDto> {
    const { actant, id } = req;

    const rewardRequest = await this.rewardRequestModel
      .findById(id)
      .populate({ path: 'userId', model: 'User' })
      .populate({ path: 'eventId', model: 'Event' })
      .populate({
        path: 'rewardTransactions.rewardId',
        model: 'Reward',
      });

    if (!rewardRequest) {
      throw RpcExceptionUtil.notFound(
        `보상 요청을 찾을 수 없습니다 (ID: ${id})`,
        'REWARD_REQUEST_NOT_FOUND',
      );
    }

    // NOTE: USER 권한의 경우 본인 요청만 조회 가능
    if (
      actant.user.role === UserRoleType.USER &&
      rewardRequest.userId &&
      (rewardRequest.userId as any)._id &&
      (rewardRequest.userId as any)._id.toString() !== actant.user.id
    ) {
      throw RpcExceptionUtil.forbidden(
        '본인이 신청한 보상 요청만 조회할 수 있습니다',
        'PERMISSION_DENIED',
      );
    }

    const rewardRequestDto: RewardRequestSummaryDto = {
      ...plainToInstance(RewardRequestDto, rewardRequest, {
        excludeExtraneousValues: true,
        enableCircularCheck: true,
      }),
      rewardTransactions: plainToInstance(
        RewardTransactionDto,
        rewardRequest.rewardTransactions,
        {
          excludeExtraneousValues: true,
          enableCircularCheck: true,
        },
      ),
      user: plainToInstance(UserDto, rewardRequest.userId, {
        excludeExtraneousValues: true,
        enableCircularCheck: true,
      }),
      event: plainToInstance(EventDto, rewardRequest.eventId, {
        excludeExtraneousValues: true,
        enableCircularCheck: true,
      }),
    };

    return rewardRequestDto;
  }

  async createEventRewardRequest(req: {
    actant: AuthActant;
    id: string;
    createEventRewardRequestDto: CreateEventRewardRequestResponseDto;
  }): Promise<CreateEventRewardRequestResponseDto> {
    const { actant, id } = req;

    const { rewards, ...event } = await this.eventService.getEventSummaryById({
      id,
    });

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

    const now = dayjs().toDate();

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

    const existingRequests = await this.rewardRequestModel.find({
      userId: actant.user.id,
      eventId: event.id,
    });

    if (
      existingRequests.length > 0 &&
      existingRequests.some(
        (request) => request.status === RewardRequestStatusType.SUCCESS,
      )
    ) {
      throw RpcExceptionUtil.conflict(
        `이미 해당 이벤트에 대한 보상 요청이 존재합니다`,
        'REWARD_REQUEST_ALREADY_EXISTS',
      );
    }

    const rewardRequest = await this.rewardRequestModel.create({
      userId: actant.user.id,
      eventId: id,
      isRewardable: false,
      status: RewardRequestStatusType.REQUESTED,
      rewardTransaction: [],
      requestedAt: now,
    });

    let failReason: string | null = null;

    const userActivities = await (() => {
      try {
        return this.getUserActivitiesRpc(actant.user.id);
      } catch (error) {
        failReason = error.message;
        return [] as UserActivityDto[];
      }
    })();

    const isRewardable = this.getQualificationData(event, userActivities);

    if (isRewardable) {
      const rewardTransactions = rewards.map((reward) => ({
        rewardId: reward.id,
        status: RewardTransactionStatusType.DONE,
        transactedAt: now,
      }));

      await this.rewardRequestModel.updateOne(
        { _id: rewardRequest._id },
        {
          isRewardable,
          status: RewardRequestStatusType.SUCCESS,
          rewardTransactions,
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

    const updatedRewardRequest = await this.rewardRequestModel
      .findById(rewardRequest._id)
      .exec();

    return {
      ...plainToInstance(
        CreateEventRewardRequestResponseDto,
        updatedRewardRequest,
        {
          excludeExtraneousValues: true,
          enableCircularCheck: true,
        },
      ),
      rewardTransactions: plainToInstance(
        RewardTransactionDto,
        updatedRewardRequest!.rewardTransactions,
        {
          excludeExtraneousValues: true,
          enableCircularCheck: true,
        },
      ),
    };
  }

  private getQualificationData(
    event: EventDto,
    userActivities: UserActivityDto[],
  ): boolean {
    return event.conditions.every((condition) => {
      switch (condition.type) {
        case EventConditionType.USER_INVITE: {
          const inviteActivities = userActivities.filter(
            (act) => act.type === UserActivityType.USER_INVITE,
          );

          const { inviteCount } = condition.metadata as UserInviteMetadata;

          return inviteActivities.length >= inviteCount;
        }
        case EventConditionType.LOGIN_CONSECUTIVE_DAYS: {
          const { consecutiveDays } =
            condition.metadata as LoginConsecutiveMetadata;
          const loginDays = userActivities
            .filter((act) => act.type === UserActivityType.LOGIN)
            .map((act) => dayjs(act.createdAt).format('YYYY-MM-DD'));

          const uniqueDays = [...new Set(loginDays)].sort();

          let maxConsecutiveDays = 0;
          let currentConsecutiveDays = 1;

          for (let i = 1; i < uniqueDays.length; i++) {
            const prevDay = dayjs(uniqueDays[i - 1]);
            const currDay = dayjs(uniqueDays[i]);

            if (currDay.diff(prevDay, 'day') === 1) {
              currentConsecutiveDays++;
            } else {
              maxConsecutiveDays = Math.max(
                maxConsecutiveDays,
                currentConsecutiveDays,
              );
              currentConsecutiveDays = 1;
            }
          }

          maxConsecutiveDays = Math.max(
            maxConsecutiveDays,
            currentConsecutiveDays,
          );

          return maxConsecutiveDays >= consecutiveDays;
        }
        case EventConditionType.LOGIN_BETWEEN: {
          const { startDate, endDate } =
            condition.metadata as LoginBetweenMetadata;

          const startDateCondition = dayjs(startDate);
          const endDateCondition = dayjs(endDate);

          const loginBetweenCount = userActivities.filter((act) => {
            const loginAt = dayjs(act.createdAt);

            return (
              (loginAt.isAfter(startDateCondition, 'day') ||
                loginAt.isSame(startDateCondition, 'day')) &&
              (loginAt.isBefore(endDateCondition, 'day') ||
                loginAt.isSame(endDateCondition, 'day'))
            );
          }).length;

          return loginBetweenCount > 0;
        }
        case EventConditionType.QUEST_CLEAR_COUNT: {
          const { clearCount: clearCountCondition } =
            condition.metadata as QuestClearCountMetadata;

          const questClearCount = userActivities.filter(
            (act) => act.type === UserActivityType.QUEST_CLEAR,
          ).length;

          return questClearCount >= clearCountCondition;
        }
        case EventConditionType.QUEST_CLEAR_SPECIFIC: {
          const { questIds: questIdsCondition } =
            condition.metadata as QuestClearSpecificMetadata;

          const questClearActivities = userActivities.filter(
            (act) => act.type === UserActivityType.QUEST_CLEAR,
          );

          const questClearCount = questClearActivities.filter((act) => {
            const { questId } = act.metadata as QuestClearMetadata;

            return questIdsCondition.includes(questId);
          }).length;

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
  ): Promise<UserActivityDto[]> {
    try {
      return await firstValueFrom(
        this.authClient.send('user_activity_get_user_activities', { userId }),
      );
    } catch (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }
  }
}
