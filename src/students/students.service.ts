import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { StudentProfileUpdateDto } from './dtos/student-profile-update.dto';
import { validateStudent } from '../common/helpers/validate-student';
import { StudentFilterDto } from './dtos/student-filter.dto';

@Injectable()
export class StudentsService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  async getAllStudents(query: StudentFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {
      ...(query.search && {
        OR: [
          { fullname: { contains: query.search, mode: 'insensitive' } },
          { NPM: { contains: query.search, mode: 'insensitive' } },
          {
            user: {
              username: { contains: query.search, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    const students = await this.prismaService.student.findMany({
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

    const studentCount = await this.prismaService.student.count({ where });

    return {
      students,
      meta: {
        page,
        limit,
        total: studentCount,
        totalPages: Math.ceil(studentCount / limit),
      },
    };
  }

  async getStudentDetail(studentId: string) {
    const student = await this.prismaService.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        user: {
          select: {
            email: true,
            username: true,
            image_url: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Akun mahasiswa tidak ditemukan.');
    }

    return student;
  }

  async sendStudentUpdateOtp(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ForbiddenException('User tidak ditemukan');

    const existingOtp = await this.prismaService.oneTimePassword.findFirst({
      where: {
        user_id: userId,
        purpose: 'EDIT_STUDENT',
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
        purpose: 'EDIT_STUDENT',
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await this.mailerService.sendMailWithTemplate(
      user.email,
      'Kode OTP Update Profil',
      'otp-edit-student',
      { otp_code: otp_code.split(''), username: user.username },
    );

    return { message: 'OTP telah dikirim ke email Anda.' };
  }

  async updateMyProfile(
    userId: string,
    data: Partial<StudentProfileUpdateDto>,
    otp: string,
  ) {
    try {
      const otpRecord = await this.prismaService.oneTimePassword.findFirst({
        where: {
          user_id: userId,
          code: otp,
          purpose: 'EDIT_STUDENT',
          expires_at: { gt: new Date() },
          used: false,
        },
      });

      if (!otpRecord) {
        throw new ForbiddenException('OTP tidak valid atau sudah kedaluwarsa.');
      }

      const existingStudent = await this.prismaService.student.findUnique({
        where: { user_id: userId },
      });

      if (
        existingStudent &&
        existingStudent.status === 'APPROVED' &&
        (data.NPM !== existingStudent.NPM ||
          data.fullname?.toLowerCase() !==
            existingStudent.fullname.toLowerCase())
      ) {
        throw new BadRequestException(
          'NPM dan nama tidak bisa diubah karena status sudah APPROVED',
        );
      }

      if (!existingStudent || existingStudent.status !== 'APPROVED') {
        await validateStudent(data.NPM, data.fullname);
      }

      const updatedStudent = await this.prismaService.student.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          NPM: data.NPM,
          fullname: data.fullname,
          address: data.address,
          phone_number: data.phone_number,
          linkedin_url: data.linkedin_url,
          instagram_url: data.instagram_url,
          gender: data.gender,
          CV_file: data.CV_file,
          KTM_file: data.KTM_file,
          province_id: data.province_id,
          city_id: data.city_id,
          district_id: data.district_id,
          village_id: data.village_id,
          status: 'APPROVED',
        },
        update: {
          address: data.address,
          phone_number: data.phone_number,
          linkedin_url: data.linkedin_url,
          instagram_url: data.instagram_url,
          CV_file: data.CV_file,
          KTM_file: data.KTM_file,
          province_id: data.province_id,
          city_id: data.city_id,
          district_id: data.district_id,
          village_id: data.village_id,
          ...(existingStudent?.status !== 'APPROVED' && {
            NPM: data.NPM,
            fullname: data.fullname,
            status: 'APPROVED',
          }),
        },
      });

      await this.prismaService.oneTimePassword.deleteMany({
        where: {
          user_id: userId,
          purpose: 'EDIT_STUDENT',
        },
      });

      return updatedStudent;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          'Gagal mengambil data dari API eksternal',
        );
      }
      throw error;
    }
  }

  async deleteStudent(studentId: string) {
    const student = await this.prismaService.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new NotFoundException('Akun mahasiswa tidak ditemukan.');
    }

    await this.prismaService.student.delete({
      where: {
        id: studentId,
      },
    });

    return { message: 'Akun mahasiswa berhasil dihapus.' };
  }
}
