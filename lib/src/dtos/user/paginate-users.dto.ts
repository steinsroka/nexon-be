import {
  PaginationRequestDto,
  PaginationResponseDto,
} from '../common/pagination.dto';
import { UserDto } from './user.dto';

export class PaginateUsersRequestDto extends PaginationRequestDto {}
export class PaginateUsersResponseDto extends PaginationResponseDto<UserDto> {}
