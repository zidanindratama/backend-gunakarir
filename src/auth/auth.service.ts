import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/auth.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new HttpException('Password salah', HttpStatus.UNAUTHORIZED);
    }

    return user;
  }

  async validateGoogleUser(profile: any) {
    const email = profile.emails[0].value;
    const imageUrl = profile.photos?.[0]?.value || '';

    const user = await this.prismaService.user.findUnique({ where: { email } });

    if (user) return user;

    const newUser = await this.prismaService.user.create({
      data: {
        username: profile.displayName,
        email,
        password: '',
        role: 'MAHASISWA',
        imageUrl,
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

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: 'MAHASISWA',
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
        'User tidak ditemukan atau belum punya password',
        HttpStatus.NOT_FOUND,
      );
    }

    const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new HttpException('Password lama salah', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }
}
