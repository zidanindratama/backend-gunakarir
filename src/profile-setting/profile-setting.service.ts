import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { ProfileSettingUpdateDto } from './dtos/profile-setting-update.dto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { validateMahasiswa } from '../common/helpers/validate-mahasiswa';

@Injectable()
export class ProfileSettingService {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
  ) {}

  async updateMyProfile(
    userId: string,
    data: Partial<ProfileSettingUpdateDto>,
  ) {
    try {
      const existingMahasiswa = await this.prismaService.mahasiswa.findUnique({
        where: { user_id: userId },
      });

      if (
        existingMahasiswa &&
        existingMahasiswa.status === 'APPROVED' &&
        (data.NPM !== existingMahasiswa.NPM ||
          data.fullname?.toLowerCase() !==
            existingMahasiswa.fullname.toLowerCase())
      ) {
        throw new BadRequestException(
          'NPM dan nama tidak bisa diubah karena status sudah APPROVED',
        );
      }

      if (!existingMahasiswa || existingMahasiswa.status !== 'APPROVED') {
        await validateMahasiswa(data.NPM, data.fullname);
      }

      const updatedMahasiswa = await this.prismaService.mahasiswa.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          NPM: data.NPM,
          fullname: data.fullname,
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
          ...(existingMahasiswa?.status !== 'APPROVED' && {
            NPM: data.NPM,
            fullname: data.fullname,
            status: 'APPROVED',
          }),
        },
      });

      return updatedMahasiswa;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(
          'Gagal mengambil data dari API eksternal',
        );
      }
      throw error;
    }
  }
}
