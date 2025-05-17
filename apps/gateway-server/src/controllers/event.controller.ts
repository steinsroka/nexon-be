import { Actant, Roles } from '@lib/decorators';
import {
  CreateEventRequestDto,
  CreateEventResponseDto,
} from '@lib/dtos/event/create-event.dto';
import { UserRoleType } from '@lib/enums';
import { JwtAuthGuard } from '@lib/guards';
import { RolesGuard } from '@lib/guards/roles.guard';
import { AuthActant } from '@lib/types/actant.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventService } from '../services/event.service';
import {
  UpdateEventRequestDto,
  UpdateEventResponseDto,
} from '@lib/dtos/event/update-event.dto';
import { SoftDeleteEventResponseDto } from '@lib/dtos/event/soft-delete-event.dto';
import {
  PaginateEventsRequestDto,
  PaginateEventsResponseDto,
} from '@lib/dtos/event/paginate-events.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetEventByIdResponseDto } from '@lib/dtos/event/get-event-by-id.dto';
import { Serializer } from '@lib/interceptors';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: '이벤트 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '이벤트 목록 조회 성공',
    type: PaginateEventsResponseDto,
  })
  // @Serializer(PaginateEventsResponseDto) TODO: Generic으로 전달된 타입에 대한 Serializer 적용이 안되고 있어 주석처리
  async paginateEvents(
    @Query() paginateEventsRequestDto: PaginateEventsRequestDto,
  ): Promise<PaginateEventsResponseDto> {
    return this.eventService.paginateEvents({ paginateEventsRequestDto });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.OPERATOR, UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 생성' })
  @ApiResponse({
    status: 201,
    description: '이벤트 생성 성공',
    type: CreateEventResponseDto,
  })
  @Serializer(CreateEventResponseDto)
  async createEvent(
    @Actant() actant: AuthActant,
    @Body() createEventRequestDto: CreateEventRequestDto,
  ): Promise<CreateEventResponseDto> {
    return this.eventService.createEvent({ actant, createEventRequestDto });
  }

  @Get(':id')
  @ApiOperation({ summary: '이벤트 조회' })
  @ApiResponse({
    status: 200,
    description: '이벤트 조회 성공',
    type: GetEventByIdResponseDto,
  })
  @Serializer(GetEventByIdResponseDto)
  async getEventById(
    @Param('id') id: string,
  ): Promise<GetEventByIdResponseDto> {
    return this.eventService.getEventById({ id });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.OPERATOR, UserRoleType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 수정' })
  @ApiResponse({
    status: 200,
    description: '이벤트 수정 성공',
    type: UpdateEventResponseDto,
  })
  @Serializer(UpdateEventResponseDto)
  async updateEvent(
    @Actant() actant: AuthActant,
    @Param('id') id: string,
    @Body() updateEventRequestDto: UpdateEventRequestDto,
  ): Promise<UpdateEventResponseDto> {
    return this.eventService.updateEvent({ actant, id, updateEventRequestDto });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiResponse({
    status: 200,
    description: '이벤트 삭제 성공',
    type: SoftDeleteEventResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoleType.OPERATOR, UserRoleType.ADMIN)
  @Serializer(SoftDeleteEventResponseDto)
  async softDeleteEvent(
    @Actant() actant: AuthActant,
    @Param('id') id: string,
  ): Promise<SoftDeleteEventResponseDto> {
    return this.eventService.softDeleteEvent({ actant, id });
  }
}
