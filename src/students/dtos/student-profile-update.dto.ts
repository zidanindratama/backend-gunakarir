import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const StudentProfileUpdateSchema = z.object({
  NPM: z.string().min(8, 'NPM minimal 8 karakter'),
  fullname: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 karakter'),
  gender: z.enum(['MALE', 'FEMALE']),
  CV_file: z.string().optional(),
  KTM_file: z.string().optional(),

  linkedin_url: z.string().url('URL LinkedIn tidak valid').optional(),
  instagram_url: z.string().url('URL Instagram tidak valid').optional(),

  province_id: z.string(),
  city_id: z.string(),
  district_id: z.string(),
  village_id: z.string(),
});

export class StudentProfileUpdateDto extends createZodDto(
  StudentProfileUpdateSchema,
) {}
