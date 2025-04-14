import { ForbiddenException, Injectable } from '@nestjs/common';
import { RecruiterRequestDto } from './dtos/recruiter-request.dto';
import { AdminReviewDto } from './dtos/admin-review.dto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecruitersService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  async recruiterRequestCreate(userId: string, data: RecruiterRequestDto) {
    const existingRecruiter = await this.prismaService.recruiter.findUnique({
      where: { userId },
    });

    if (existingRecruiter) {
      throw new ForbiddenException('Anda sudah mengajukan sebagai recruiter.');
    }

    const recruiter = await this.prismaService.recruiter.create({
      data: {
        company: data.company,
        contract: data.contract,
        NPWP: data.NPWP,
        status: data.status ?? 'PENDING',
        linkedin: data.linkedin,
        user: { connect: { id: userId } },
      },
    });

    return recruiter;
  }

  async recruiterRequestAppeal(
    userId: string,
    data: Partial<RecruiterRequestDto>,
  ) {
    const recruiter = await this.prismaService.recruiter.findUnique({
      where: { userId },
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
      where: { userId },
      data: {
        ...data,
        status: 'PENDING',
      },
    });

    return updatedRecruiter;
  }

  async reviewRecruiterRequest(recruiterId: string, data: AdminReviewDto) {
    const recruiter = await this.prismaService.recruiter.findUnique({
      where: { id: recruiterId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Recruiter tidak ditemukan');
    }

    return this.prismaService.recruiter.update({
      where: { id: recruiterId },
      data: {
        status: data.status,
        rejectionReason:
          data.status === 'REJECTED' ? data.rejectionReason : null,
      },
    });
  }
}
