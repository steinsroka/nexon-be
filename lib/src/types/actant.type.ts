import { UserDto } from '@lib/dtos/user/user.dto';

export type AuthActant = { user: UserDto; ipAddr: string; userAgent: string };
export type UnknownActant = { ipAddr: string; userAgent: string };
export type ActantType = 'auth' | 'unknown';
