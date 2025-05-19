export const PASSWORD_MIN_LEN = 8;
export const PASSWORD_MAX_LEN = 20;
export const PASSWORD_REGEX =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;
export const NAME_MIN_LEN = 2;
export const NAME_MAX_LEN = 20;

// JWT related constants
export const DEFAULT_JWT_ISSUER = 'nexon-auth-server';
export const DEFAULT_JWT_ACCESS_EXPIRES = '15m';
export const DEFAULT_JWT_REFRESH_EXPIRES = '1h';
export const JWT_ALGORITHM = 'HS512';

// Cookie related constants
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds
export const REFRESH_TOKEN_COOKIE_PATH = '/auth/refresh';
