import { PaginationResponseDto } from '@lib/dtos/common/pagination.dto';
import { GetRewardRequestByIdResponseDto } from '@lib/dtos/reward-request/get-reward-request-by-id.dto';
import {
  PaginateRewardRequestsRequestDto,
  PaginateRewardRequestsResponseDto,
} from '@lib/dtos/reward-request/paginate-reward-requests.dto';
import { RewardRequestDto } from '@lib/dtos/reward-request/reward-request.dto';
import { UserRoleType } from '@lib/enums';
import { AuthActant } from '@lib/types/actant.type';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, Model } from 'mongoose';
import {
  RewardRequest,
  RewardRequestDocument,
} from './schemas/reward-request.schema';

@Injectable()
export class RewardRequestService {
  constructor(
    @InjectModel(RewardRequest.name)
    private rewardRequestModel: Model<RewardRequestDocument>,
  ) {}

  // async create(
  //   userId: string,
  //   dto: CreateRewardRequestDto,
  // ): Promise<RewardRequestDocument> {
  //   // 1. 이벤트 존재 여부 확인
  //   const event = await this.eventService.getEventById(dto.eventId);

  //   if (!event) {
  //     throw new NotFoundException('Event not found');
  //   }

  //   // 3. 이벤트 기간 확인
  //   const now = new Date();
  //   if (now < event.startDate || now > event.endDate) {
  //     throw new ForbiddenException('Event is not in progress');
  //   }

  //   // 4. 중복 요청 확인
  //   const existingRequest = await this.rewardRequestModel.findOne({
  //     userId: new mongoose.Types.ObjectId(userId),
  //     eventId: new mongoose.Types.ObjectId(dto.eventId),
  //   });

  //   if (existingRequest) {
  //     throw new ConflictException(
  //       'Reward request already exists for this event',
  //     );
  //   }

  //   // 5. 유저 활동 기록 조회 및 이벤트 조건 충족 검증
  //   const userActivities = await this.userActivityService.findByUserId(userId);

  //   // 이벤트 조건 검증 로직
  //   const { isRewardable, message } = this.verifyEventCondition(
  //     event,
  //     userActivities,
  //   );

  //   // 6. 보상 정보 조회
  //   const rewards = await this.rewardService.findByEventId(dto.eventId);

  //   // 7. 보상 요청 생성
  //   const rewardRequest = await this.rewardRequestModel.create({
  //     userId: new mongoose.Types.ObjectId(userId),
  //     eventId: new mongoose.Types.ObjectId(dto.eventId),
  //     qualificationData: {
  //       isRewardable,
  //       userActivities: userActivities.map((a) => a._id),
  //       verificationMessage: message,
  //     },
  //     status: isRewardable
  //       ? RewardRequestStatusType.APPROVED
  //       : RewardRequestStatusType.REJECTED,
  //     rewards: isRewardable
  //       ? rewards.map((reward) => ({
  //           rewardId: reward._id,
  //           type: reward.type,
  //           quantity: reward.quantity,
  //           itemId: reward.itemId,
  //           description: reward.description,
  //           delivered: false,
  //         }))
  //       : [],
  //     statusHistory: [
  //       {
  //         status: isRewardable
  //           ? RewardRequestStatusType.APPROVED
  //           : RewardRequestStatusType.REJECTED,
  //         changedAt: new Date(),
  //         reason: isRewardable
  //           ? '자동 승인: 조건 충족'
  //           : '자동 거부: 조건 미충족',
  //       },
  //     ],
  //     requestedAt: new Date(),
  //   });

  //   return rewardRequest;
  // }

  // private verifyEventCondition(
  //   event: any,
  //   userActivities: any[],
  // ): { isRewardable: boolean; message: string } {
  //   // 예시: 특정 활동의 수가 이벤트 조건의 필요 횟수를 충족하는지 검사
  //   // 실제 구현시 이벤트 타입에 따라 다양한 검증 로직 구현 필요
  //   switch (event.conditionType) {
  //     case 'LOGIN_CONSECUTIVE_DAYS':
  //       const loginDays = userActivities
  //         .filter((act) => act.type === 'LOGIN')
  //         .map((act) => new Date(act.createdAt).toISOString().split('T')[0]);

  //       // 중복 제거하고 정렬
  //       const uniqueDays = [...new Set(loginDays)].sort();

  //       // 연속된 날짜 계산
  //       let maxConsecutiveDays = 0;
  //       let currentConsecutiveDays = 1;

  //       for (let i = 1; i < uniqueDays.length; i++) {
  //         const date1 = new Date(uniqueDays[i - 1]);
  //         const date2 = new Date(uniqueDays[i]);

  //         // 하루 차이인지 확인
  //         const diffTime = Math.abs(date2.getTime() - date1.getTime());
  //         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  //         if (diffDays === 1) {
  //           currentConsecutiveDays++;
  //         } else {
  //           // 연속이 끊겼으므로 최대값 업데이트 후 초기화
  //           maxConsecutiveDays = Math.max(
  //             maxConsecutiveDays,
  //             currentConsecutiveDays,
  //           );
  //           currentConsecutiveDays = 1;
  //         }
  //       }

  //       // 마지막 연속 일수도 확인
  //       maxConsecutiveDays = Math.max(
  //         maxConsecutiveDays,
  //         currentConsecutiveDays,
  //       );

  //       const isRewardable = maxConsecutiveDays >= event.requiredDays;
  //       return {
  //         isRewardable,
  //         message: isRewardable
  //           ? `${maxConsecutiveDays}일 연속 로그인 성공 (필요: ${event.requiredDays}일)`
  //           : `${maxConsecutiveDays}일 연속 로그인 (필요: ${event.requiredDays}일)`,
  //       };

  //     case 'INVITE_FRIENDS':
  //       const inviteCount = userActivities.filter(
  //         (act) => act.type === 'INVITE_FRIEND',
  //       ).length;
  //       const isInviteRewardable = inviteCount >= event.requiredCount;
  //       return {
  //         isRewardable: isInviteRewardable,
  //         message: isInviteRewardable
  //           ? `친구 ${inviteCount}명 초대 성공 (필요: ${event.requiredCount}명)`
  //           : `친구 ${inviteCount}명 초대 (필요: ${event.requiredCount}명)`,
  //       };

  //     default:
  //       return {
  //         isRewardable: false,
  //         message: '지원되지 않는 이벤트 조건 타입',
  //       };
  //   }
  // }

  async paginateRewardRequests(req: {
    actant: AuthActant;
    paginateRewardRequestRequestDto: PaginateRewardRequestsRequestDto;
  }): Promise<PaginateRewardRequestsResponseDto> {
    const { actant, paginateRewardRequestRequestDto } = req;
    const {
      page = 1,
      rpp = 10,
      eventId,
      statuses,
      userId,
    } = paginateRewardRequestRequestDto;

    // 필터 조건 구성
    const filter: FilterQuery<RewardRequestDocument> = {};

    // USER 권한의 경우 본인 요청만 조회 가능
    if (actant.user.role === UserRoleType.USER) {
      filter.userId = actant.user.id;
    }
    // 특정 유저의 요청을 관리자/운영자/감사자가 조회하는 경우
    else if (userId) {
      filter.userId = userId;
    }

    // 이벤트 필터링
    if (eventId) {
      filter.eventId = eventId;
      // filter.eventId = new mongoose.Types.ObjectId(eventId);
    }

    // 상태 필터링
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

  /**
   * 특정 보상 요청 조회
   */
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
      throw new Error(`Reward request not found id: ${id}`);
    }

    // USER 권한의 경우 본인 요청만 조회 가능
    if (
      actant.user.role === UserRoleType.USER &&
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      rewardRequest.userId.toString() !== actant.user.id
    ) {
      throw new Error('You can only view your own reward requests');
    }

    return plainToInstance(GetRewardRequestByIdResponseDto, rewardRequest);
  }

  // /**
  //  * 보상 요청 상태 업데이트
  //  */
  // async updateStatus(
  //   id: string,
  //   updaterId: string,
  //   dto: UpdateRewardRequestStatusDto,
  // ): Promise<RewardRequestDocument> {
  //   const rewardRequest = await this.rewardRequestModel.findById(id);

  //   if (!rewardRequest) {
  //     throw new NotFoundException('Reward request not found');
  //   }

  //   // 상태 변경 이력 추가
  //   const statusChange = {
  //     status: dto.status,
  //     changedAt: new Date(),
  //     changedBy: new mongoose.Types.ObjectId(updaterId),
  //     reason:
  //       dto.reason || `상태 변경: ${rewardRequest.status} -> ${dto.status}`,
  //   };

  //   // 상태 업데이트
  //   const updatedRequest = await this.rewardRequestModel.findByIdAndUpdate(
  //     id,
  //     {
  //       $set: { status: dto.status },
  //       $push: { statusHistory: statusChange },
  //     },
  //     { new: true },
  //   );

  //   return updatedRequest;
  // }

  // /**
  //  * 보상 지급 상태 업데이트
  //  */
  // async updateRewardStatus(
  //   id: string,
  //   updaterId: string,
  //   dto: UpdateRewardStatusDto,
  // ): Promise<RewardRequestDocument> {
  //   const rewardRequest = await this.rewardRequestModel.findById(id);

  //   if (!rewardRequest) {
  //     throw new NotFoundException('Reward request not found');
  //   }

  //   if (
  //     rewardRequest.status !== RewardRequestStatusType.APPROVED &&
  //     rewardRequest.status !== RewardRequestStatusType.PROCESSING
  //   ) {
  //     throw new ForbiddenException(
  //       'Cannot update rewards for non-approved requests',
  //     );
  //   }

  //   // 특정 보상 찾기
  //   const rewardIndex = rewardRequest.rewards.findIndex(
  //     (r) => r.rewardId.toString() === dto.rewardId,
  //   );

  //   if (rewardIndex === -1) {
  //     throw new NotFoundException('Reward not found in this request');
  //   }

  //   // 보상 지급 상태 업데이트
  //   rewardRequest.rewards[rewardIndex].delivered = dto.delivered;
  //   rewardRequest.rewards[rewardIndex].deliveredAt =
  //     dto.deliveredAt || new Date();
  //   rewardRequest.rewards[rewardIndex].deliveredBy =
  //     new mongoose.Types.ObjectId(updaterId);

  //   // 모든 보상이 지급되었는지 확인
  //   const allDelivered = rewardRequest.rewards.every((r) => r.delivered);

  //   // 모든 보상이 지급되었다면 상태를 COMPLETED로 변경
  //   if (
  //     allDelivered &&
  //     rewardRequest.status !== RewardRequestStatusType.COMPLETED
  //   ) {
  //     rewardRequest.status = RewardRequestStatusType.COMPLETED;
  //     rewardRequest.statusHistory.push({
  //       status: RewardRequestStatusType.COMPLETED,
  //       changedAt: new Date(),
  //       changedBy: new mongoose.Types.ObjectId(updaterId),
  //       reason: '모든 보상이 지급됨',
  //     });
  //   }

  //   await rewardRequest.save();

  //   return rewardRequest;
  // }
}
