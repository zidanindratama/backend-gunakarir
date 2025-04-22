import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  UsePipes,
  Delete,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthService } from './auth.service';
import { RegisterDto, SignInDto } from './dtos/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { Public } from '../common/decorators/public.decorator';
import { setAuthCookies } from '../common/utils/cookie.util';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  @UsePipes(new ZodValidationPipe(SignInDto))
  async signin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const tokens = await this.authService.signin(user);

    const isRecruiterExist = await this.prismaService.recruiter.findUnique({
      where: {
        user_id: user.id,
      },
    });

    setAuthCookies(res, tokens, { refreshToken: true, accessToken: false });

    let redirectUrl = '/dashboard';
    if (user.role === 'RECRUITER' && isRecruiterExist === null) {
      redirectUrl = '/dashboard/recruiter-request';
    }

    return { accessToken: tokens.accessToken, redirectUrl };
  }

  @Public()
  @Post('signup')
  @UsePipes(new ZodValidationPipe(RegisterDto))
  async signup(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.signup(body);
    const tokens = await this.authService.signin(user);

    const isRecruiterExist = await this.prismaService.recruiter.findUnique({
      where: {
        user_id: user.id,
      },
    });

    setAuthCookies(res, tokens, { refreshToken: true, accessToken: false });

    let redirectUrl = '/dashboard';
    if (user.role === 'RECRUITER' && isRecruiterExist === null) {
      redirectUrl = '/dashboard/recruiter-request';
    }

    return {
      message: 'Registrasi berhasil',
      accessToken: tokens.accessToken,
      redirectUrl,
    };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req) {}

  @Public()
  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    const tokens = await this.authService.signin(user);
    setAuthCookies(res, tokens, { refreshToken: true, accessToken: false });

    const isProduction = process.env.NODE_ENV === 'production';
    const redirectUrl = isProduction
      ? 'https://frontend-gunakarir.vercel.app/callback'
      : 'http://localhost:3000/callback';

    return res.redirect(redirectUrl);
  }

  @Public()
  @Delete('signout')
  signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
      secure: process.env.NODE_ENV !== 'development',
      path: '/',
    });

    return { message: 'Logout berhasil' };
  }

  @Public()
  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      );

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new UnauthorizedException('Refresh token tidak valid');
    }
  }

  @Patch('change-password')
  @UsePipes(new ZodValidationPipe(ChangePasswordDto))
  async changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    const user = req.user;
    return this.authService.changePassword(user.id, body);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req.user;
    return this.authService.myProfile(user.id);
  }
}
