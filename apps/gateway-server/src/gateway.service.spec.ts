import { Test, TestingModule } from '@nestjs/testing';
import { GatewayService } from './gateway.service';
import { ClientProxy } from '@nestjs/microservices';
import { MicroServiceType } from '@lib/enums/microservice.enum';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { Response } from 'express';

describe('GatewayService', () => {
  let service: GatewayService;
  let authServiceClientMock: jest.Mocked<ClientProxy>;
  let eventServiceClientMock: jest.Mocked<ClientProxy>;
  let configServiceMock: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    authServiceClientMock = {
      send: jest.fn(),
    } as any;

    eventServiceClientMock = {
      send: jest.fn(),
    } as any;

    configServiceMock = {
      get: jest.fn().mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'COOKIE_DOMAIN') return 'test.com';
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GatewayService,
        {
          provide: 'AUTH_SERVICE',
          useValue: authServiceClientMock,
        },
        {
          provide: 'EVENT_SERVICE',
          useValue: eventServiceClientMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<GatewayService>(GatewayService);
  });

  describe('sendRequest', () => {
    it('should route request to auth service when MicroServiceType.AUTH_SERVICE is provided', async () => {
      const mockData = { userId: 'test-user' };
      const mockResponse = { success: true };

      authServiceClientMock.send.mockReturnValue(of(mockResponse));

      const result = await service.sendRequest<typeof mockResponse>(
        MicroServiceType.AUTH_SERVICE,
        'auth_login',
        mockData,
      );

      expect(authServiceClientMock.send).toHaveBeenCalledWith(
        'auth_login',
        mockData,
      );
      expect(result).toEqual(mockResponse);
      expect(eventServiceClientMock.send).not.toHaveBeenCalled();
    });

    it('should route request to event service when MicroServiceType.EVENT_SERVICE is provided', async () => {
      const mockData = { eventId: 'test-event' };
      const mockResponse = { id: 'event-1', title: 'Test Event' };

      eventServiceClientMock.send.mockReturnValue(of(mockResponse));

      const result = await service.sendRequest<typeof mockResponse>(
        MicroServiceType.EVENT_SERVICE,
        'event_get_event_by_id',
        mockData,
      );

      expect(eventServiceClientMock.send).toHaveBeenCalledWith(
        'event_get_event_by_id',
        mockData,
      );
      expect(result).toEqual(mockResponse);
      expect(authServiceClientMock.send).not.toHaveBeenCalled();
    });

    it('should throw error when service is unknown', async () => {
      const mockData = { test: 'data' };

      await expect(
        service.sendRequest(
          'UNKNOWN_SERVICE' as MicroServiceType,
          'test',
          mockData,
        ),
      ).rejects.toThrow('Unknown service');
    });

    it('should propagate errors from microservices', async () => {
      const mockData = { userId: 'test-user' };
      const mockError = new Error('Service error');

      authServiceClientMock.send.mockReturnValue(throwError(() => mockError));

      await expect(
        service.sendRequest(
          MicroServiceType.AUTH_SERVICE,
          'auth_login',
          mockData,
        ),
      ).rejects.toThrow(mockError);
    });
  });

  describe('cookie management', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
      };
    });

    it('should set refresh token cookie correctly in development environment', () => {
      configServiceMock.get.mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'COOKIE_DOMAIN') return 'test.com';
        return null;
      });

      const token = 'test-refresh-token';

      service.setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 86400000, // 1일 (밀리초)
        path: '/auth/refresh',
        domain: 'test.com',
      });
    });

    it('should set refresh token cookie correctly in production environment', () => {
      configServiceMock.get.mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'COOKIE_DOMAIN') return 'test.com';
        return null;
      });

      const token = 'test-refresh-token';

      service.setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 86400000, // 1일 (밀리초)
        path: '/auth/refresh',
        domain: 'test.com',
      });
    });

    it('should set refresh token cookie without domain when not provided', () => {
      configServiceMock.get.mockImplementation((key) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'COOKIE_DOMAIN') return null;
        return null;
      });

      const token = 'test-refresh-token';

      service.setRefreshTokenCookie(mockResponse as Response, token);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 86400000, // 1일 (밀리초)
        path: '/auth/refresh',
      });
    });

    it('should clear refresh token cookie', () => {
      service.clearRefreshTokenCookie(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    });
  });
});
