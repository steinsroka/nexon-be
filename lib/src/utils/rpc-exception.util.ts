import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  ERROR_CODE_BAD_REQUEST,
  ERROR_CODE_CONFLICT,
  ERROR_CODE_FORBIDDEN,
  ERROR_CODE_INTERNAL_SERVER_ERROR,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_UNAUTHORIZED,
} from '@lib/constants/error.constant';

/**
 * 표준화된 RPC 예외를 생성하는 유틸리티 클래스
 */
export class RpcExceptionUtil {
  /**
   * 표준화된 RPC 예외를 생성합니다.
   * @param message 에러 메시지
   * @param status HTTP 상태 코드
   * @param code 에러 코드
   * @returns RpcException 객체
   */
  static create(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string = ERROR_CODE_INTERNAL_SERVER_ERROR,
  ): RpcException {
    return new RpcException({
      message,
      status,
      code,
    });
  }

  /**
   * 잘못된 요청 (400) 에러를 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드
   */
  static badRequest(
    message: string,
    code: string = ERROR_CODE_BAD_REQUEST,
  ): RpcException {
    return this.create(message, HttpStatus.BAD_REQUEST, code);
  }

  /**
   * 인증 실패 (401) 에러를 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드
   */
  static unauthorized(
    message: string,
    code: string = ERROR_CODE_UNAUTHORIZED,
  ): RpcException {
    return this.create(message, HttpStatus.UNAUTHORIZED, code);
  }

  /**
   * 접근 권한 없음 (403) 에러를 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드
   */
  static forbidden(
    message: string,
    code: string = ERROR_CODE_FORBIDDEN,
  ): RpcException {
    return this.create(message, HttpStatus.FORBIDDEN, code);
  }

  /**
   * 리소스 찾을 수 없음 (404) 에러를 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드
   */
  static notFound(
    message: string,
    code: string = ERROR_CODE_NOT_FOUND,
  ): RpcException {
    return this.create(message, HttpStatus.NOT_FOUND, code);
  }

  /**
   * 충돌 (409) 에러를 생성합니다.
   * @param message 에러 메시지
   * @param code 에러 코드
   */
  static conflict(
    message: string,
    code: string = ERROR_CODE_CONFLICT,
  ): RpcException {
    return this.create(message, HttpStatus.CONFLICT, code);
  }
}
