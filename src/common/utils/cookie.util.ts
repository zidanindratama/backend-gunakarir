import { Response } from 'express';

type TokenOptions = {
  accessToken?: boolean;
  refreshToken?: boolean;
};

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  options: TokenOptions = { accessToken: true, refreshToken: true },
) {
  const req = res.req;

  const isLocalFrontend =
    req.headers.origin?.includes('localhost') ||
    req.headers.host?.includes('localhost') ||
    req.hostname === 'localhost' ||
    req.hostname === '127.0.0.1';

  const cookieBaseConfig = {
    httpOnly: true,
    sameSite: isLocalFrontend ? 'lax' : ('none' as 'lax' | 'none'),
    secure: !isLocalFrontend,
    path: '/',
  };

  if (options.refreshToken) {
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieBaseConfig,
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 hari
    });
  }

  if (options.accessToken) {
    res.cookie('access_token', tokens.accessToken, {
      ...cookieBaseConfig,
      maxAge: 15 * 60 * 1000, // 15 menit
    });
  }
}
