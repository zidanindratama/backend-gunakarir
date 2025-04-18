import axios from 'axios';
import { BadRequestException } from '@nestjs/common';
import { ResponseListStudentPDDIKTI } from '../types/response-api-student-pddikti.type';

export const validateStudent = async (npm: string, fullname?: string) => {
  const response = await axios.get(
    `https://api-pddikti.ridwaanhall.com/search/mhs/${npm}`,
  );

  const studentAPIRes: ResponseListStudentPDDIKTI = response.data;

  if (!Array.isArray(studentAPIRes)) {
    throw new BadRequestException('Format data dari API tidak sesuai');
  }

  const matched = studentAPIRes.find(
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
