import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';
import { AdminReviewDto } from './dtos/admin-review.dto';
import { RecruiterFilterDto } from './dtos/recruiter-filter.dto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecruitersService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  async getAllRecruiters(query: RecruiterFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.RecruiterWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { company_name: { contains: query.search, mode: 'insensitive' } },
          { NPWP: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const recruiters = await this.prismaService.recruiter.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: {
          select: {
            email: true,
            username: true,
            image_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const recruiterCount = await this.prismaService.recruiter.count({ where });

    return {
      recruiters,
      meta: {
        page,
        limit,
        total: recruiterCount,
        totalPages: Math.ceil(recruiterCount / limit),
      },
    };
  }

  async getRecruiterDetail(recruiterId: string) {
    const recruiter = await this.prismaService.recruiter.findUnique({
      where: {
        id: recruiterId,
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            image_url: true,
          },
        },
        jobs: true,
      },
    });

    if (!recruiter) {
      throw new NotFoundException('Akun recruiter tidak ditemukan.');
    }

    return recruiter;
  }

  async recruiterRequestCreate(userId: string, data: RecruiterRequestDto) {
    const { username, image_url, ...rest } = data;

    const existingRecruiter = await this.prismaService.recruiter.findUnique({
      where: { user_id: userId },
    });

    if (existingRecruiter) {
      throw new ForbiddenException('Anda sudah mengajukan sebagai recruiter.');
    }

    const recruiter = await this.prismaService.recruiter.create({
      data: {
        user: { connect: { id: userId } },
        NPWP: rest.NPWP,
        company_name: rest.company_name,
        company_logo: rest.company_logo,
        company_description: rest.company_description,
        contract_file: rest.contract_file,
        address: rest.address,
        phone_number: rest.phone_number,

        linkedin_url: rest.linkedin_url,
        instagram_url: rest.instagram_url,
        status: rest.status ?? 'PENDING',

        province_id: rest.province_id,
        city_id: rest.city_id,
        district_id: rest.district_id,
        village_id: rest.village_id,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (username || image_url) {
      if (username) {
        const existingUsername = await this.prismaService.user.findFirst({
          where: {
            username: username,
            NOT: { id: userId },
          },
        });

        if (existingUsername) {
          throw new BadRequestException('Username sudah digunakan.');
        }
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...(username && { username: username }),
          ...(image_url && { image_url: image_url }),
        },
      });
    }

    await this.mailerService.sendMailWithTemplate(
      recruiter.user.email,
      'Permohonan Kerja Sama',
      'recruiter-request',
      { company_name: recruiter.company_name },
    );

    return recruiter;
  }

  async recruiterRequestAppeal(
    userId: string,
    data: Partial<
      RecruiterRequestDto & {
        username?: string;
        image_url?: string;
      }
    >,
  ) {
    const recruiter = await this.prismaService.recruiter.findUnique({
      where: { user_id: userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Data recruiter tidak ditemukan.');
    }

    if (recruiter.status !== 'REJECTED') {
      throw new ForbiddenException(
        'Banding hanya bisa diajukan jika status Anda REJECTED.',
      );
    }

    const updatedRecruiter = await this.prismaService.recruiter.update({
      where: { user_id: userId },
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    await this.mailerService.sendMailWithTemplate(
      updatedRecruiter.user.email,
      'Permohonan Pengajuan Bandiing Kerja Sama',
      'recruiter-appeal',
      { company_name: updatedRecruiter.company_name },
    );

    return updatedRecruiter;
  }

  async reviewRecruiterRequest(recruiterId: string, data: AdminReviewDto) {
    const recruiter = await this.prismaService.recruiter.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Recruiter tidak ditemukan');
    }

    const reviewRecruiter = await this.prismaService.recruiter.update({
      where: { id: recruiterId },
      data: {
        status: data.status,
        rejection_reason:
          data.status === 'REJECTED' ? data.rejection_reason : null,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    await this.mailerService.sendMailWithTemplate(
      reviewRecruiter.user.email,
      'Hasil Review Kerja Sama',
      'recruiter-review',
      {
        company_name: reviewRecruiter.company_name,
        rejection_reason: reviewRecruiter.rejection_reason,
        status: reviewRecruiter.status,
      },
    );

    return reviewRecruiter;
  }

  async sendRecruiterUpdateOtp(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        recruiter: {
          select: {
            company_name: true,
          },
        },
      },
    });

    if (!user) throw new ForbiddenException('User tidak ditemukan');

    const existingOtp = await this.prismaService.oneTimePassword.findFirst({
      where: {
        user_id: userId,
        purpose: 'EDIT_RECRUITER',
        used: false,
        expires_at: { gt: new Date() },
      },
    });

    if (existingOtp) {
      throw new ForbiddenException(
        'OTP masih aktif, silakan cek email Anda atau tunggu beberapa saat.',
      );
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prismaService.oneTimePassword.create({
      data: {
        user_id: userId,
        code: otp_code,
        purpose: 'EDIT_RECRUITER',
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 menit
      },
    });

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Kode OTP Update Profil',
      'otp-edit-recruiter',
      {
        otp_code: otp_code.split(''),
        company_name: user.recruiter?.company_name ?? 'Perusahaan Anda',
      },
    );

    return { message: 'OTP telah dikirim ke email Anda' };
  }

  async updateRecruiterWhilePending(
    userId: string,
    data: Partial<RecruiterRequestDto>,
  ) {
    const { username, image_url, ...rest } = data;

    const recruiter = await this.prismaService.recruiter.findUnique({
      where: { user_id: userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Recruiter tidak ditemukan.');
    }

    if (recruiter.status !== 'PENDING') {
      throw new ForbiddenException('Hanya bisa mengedit saat status PENDING.');
    }

    const updatedRecruiter = await this.prismaService.recruiter.update({
      where: { user_id: userId },
      data: rest,
    });

    if (username || image_url) {
      if (username) {
        const existingUsername = await this.prismaService.user.findFirst({
          where: {
            username: username,
            NOT: { id: userId },
          },
        });

        if (existingUsername) {
          throw new BadRequestException('Username sudah digunakan.');
        }
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...(username && { username: username }),
          ...(image_url && { image_url: image_url }),
        },
      });
    }

    return updatedRecruiter;
  }

  async updateRecruiterWithOtp(
    userId: string,
    otp: string,
    data: Partial<RecruiterRequestDto>,
  ) {
    const { username, image_url, ...rest } = data;

    const otpRecord = await this.prismaService.oneTimePassword.findFirst({
      where: {
        user_id: userId,
        code: otp,
        purpose: 'EDIT_RECRUITER',
        expires_at: { gt: new Date() },
        used: false,
      },
    });

    if (!otpRecord) {
      throw new ForbiddenException('OTP tidak valid atau sudah kedaluwarsa.');
    }

    const updatedRecruiter = await this.prismaService.recruiter.update({
      where: { user_id: userId },
      data: rest,
    });

    if (username || image_url) {
      if (username) {
        const existingUsername = await this.prismaService.user.findFirst({
          where: {
            username: username,
            NOT: { id: userId },
          },
        });

        if (existingUsername) {
          throw new BadRequestException('Username sudah digunakan.');
        }
      }

      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          ...(username && { username: username }),
          ...(image_url && { image_url: image_url }),
        },
      });
    }

    await this.prismaService.oneTimePassword.deleteMany({
      where: {
        user_id: userId,
        purpose: 'EDIT_RECRUITER',
      },
    });

    return updatedRecruiter;
  }

  async deleteRecruiter(recruiterId: string) {
    const student = await this.prismaService.recruiter.findUnique({
      where: {
        id: recruiterId,
      },
    });

    if (!student) {
      throw new NotFoundException('Rekruter tidak ditemukan.');
    }

    await this.prismaService.recruiter.delete({
      where: {
        id: recruiterId,
      },
    });

    return { message: 'Rekruter berhasil dihapus.' };
  }
}
