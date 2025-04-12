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
  const isDev = process.env.NODE_ENV === 'development';

  if (options.refreshToken) {
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      sameSite: isDev ? 'lax' : 'none',
      secure: !isDev,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  if (options.accessToken) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      sameSite: isDev ? 'lax' : 'none',
      secure: !isDev,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
  }
}
