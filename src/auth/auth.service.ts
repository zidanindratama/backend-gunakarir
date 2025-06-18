import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { RegisterDto } from './dtos/auth.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminProfileUpdateDto } from './dtos/admin-profile-update.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser({ email, password }: { email: string; password: string }) {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('Email tidak ditemukan', HttpStatus.UNAUTHORIZED);
    }

    if (!user.password) {
      throw new HttpException(
        'User menggunakan Google login',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;
    const imageUrl = profile.photos?.[0]?.value || '';

    const baseUsername = profile.displayName.replace(/\s+/g, '');
    let username = baseUsername;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) return existingUser;

    let isUsernameTaken = await this.prismaService.user.findUnique({
      where: { username },
    });

    let count = 1;
    while (isUsernameTaken) {
      username = `${baseUsername}_${count}`;
      isUsernameTaken = await this.prismaService.user.findUnique({
        where: { username },
      });
      count++;
    }

    const newUser = await this.prismaService.user.create({
      data: {
        username,
        email,
        password: '',
        role: 'STUDENT',
        image_url: imageUrl,
      },
    });

    return newUser;
  }

  async signup(data: RegisterDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new HttpException('Email sudah terdaftar', HttpStatus.BAD_REQUEST);
    }

    const baseUsername = data.username.replace(/\s+/g, '');
    let username = baseUsername;

    let isUsernameTaken = await this.prismaService.user.findUnique({
      where: { username },
    });

    let count = 1;
    while (isUsernameTaken) {
      username = `${baseUsername}_${count}`;
      isUsernameTaken = await this.prismaService.user.findUnique({
        where: { username },
      });
      count++;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        username: username,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Signup Berhasil',
      'welcome',
      { username: user.username },
    );

    return user;
  }

  async signin(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Signin Berhasil',
      'welcome',
      { username: user.username },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(userId: string, payload: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new HttpException(
        'Akun ini signin menggunakan Google dan tidak memiliki password untuk diubah',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isMatch = await bcrypt.compare(payload.old_password, user.password);
    if (!isMatch) {
      throw new HttpException('Password lama salah', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(payload.new_password, 10);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  async myProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            educations: true,
            workExperiences: true,
            organizationalExperiences: true,
          },
        },
        recruiter: {
          include: {
            jobs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async updateAdminProfile(userId: string, data: AdminProfileUpdateDto) {
    const existingUsername = await this.prismaService.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: userId },
      },
    });

    if (existingUsername) {
      throw new BadRequestException('Username sudah digunakan.');
    }

    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.image_url && { image_url: data.image_url }),
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new HttpException(
        'Akun tidak ditemukan atau tidak bisa reset password.',
        HttpStatus.NOT_FOUND,
      );
    }

    const token = randomUUID();
    const expiresAt = dayjs().add(1, 'hour').toDate();

    await this.prismaService.passwordResetToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';

    const resetLink = isProd
      ? `https://frontend-gunakarir.vercel.app/password/reset?token=${token}`
      : `http://localhost:3000/password/reset?token=${token}`;

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Reset Password GunaKarir',
      'forgot-password',
      {
        username: user.username,
        resetLink,
      },
    );

    return {
      message: 'Link reset password telah dikirim ke email (simulasi).',
    };
  }

  async resendForgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      throw new HttpException(
        'Akun tidak ditemukan atau tidak bisa reset password.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prismaService.passwordResetToken.deleteMany({
      where: {
        user_id: user.id,
        used: false,
        expires_at: { gt: new Date() },
      },
    });

    const token = randomUUID();
    const expiresAt = dayjs().add(1, 'hour').toDate();

    await this.prismaService.passwordResetToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    const isProd = process.env.NODE_ENV === 'production';

    const resetLink = isProd
      ? `https://frontend-gunakarir.vercel.app/password/reset?token=${token}`
      : `http://localhost:3000/password/reset?token=${token}`;

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Reset Password GunaKarir',
      'forgot-password',
      {
        username: user.username,
        resetLink,
      },
    );

    return {
      message: 'Link reset password berhasil dikirim ulang (simulasi).',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, new_password } = dto;

    const resetToken = await this.prismaService.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expires_at < new Date()) {
      throw new HttpException(
        'Token tidak valid atau sudah kadaluarsa',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await this.prismaService.user.update({
      where: { id: resetToken.user_id },
      data: { password: hashedPassword },
    });

    await this.prismaService.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return { message: 'Password berhasil direset.' };
  }
}
