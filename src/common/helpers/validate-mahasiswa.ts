import axios from 'axios';
import { BadRequestException } from '@nestjs/common';
import { ResponseListMahasiswaPDDIKTI } from '../../common/types/response-api-mahasiswa-pddikti.type';

export const validateMahasiswa = async (npm: string, fullname?: string) => {
  const response = await axios.get(
    `https://api-pddikti.ridwaanhall.com/search/mhs/${npm}`,
  );

  const mahasiswaAPIRes: ResponseListMahasiswaPDDIKTI = response.data;

  if (!Array.isArray(mahasiswaAPIRes)) {
    throw new BadRequestException('Format data dari API tidak sesuai');
  }

  const matched = mahasiswaAPIRes.find(
    (m) =>
      m.nim === npm &&
      m.nama.toLowerCase() === fullname?.toLowerCase() &&
      m.nama_pt.toLowerCase() === 'universitas gunadarma',
  );

  if (!matched) {
    throw new BadRequestException(
      'Data mahasiswa tidak valid atau bukan dari Universitas Gunadarma',
    );
  }

  return matched;
};
