import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RecruiterRequestSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  image_url: z.string().url('URL gambar tidak valid').optional(),

  NPWP: z.string(),
  company_name: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
  company_logo: z.string(),
  company_description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  contract_file: z.string(),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 karakter'),

  linkedin_url: z.string().url('URL LinkedIn tidak valid').optional(),
  instagram_url: z.string().url('URL Instagram tidak valid').optional(),

  status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).default('PENDING'),

  province_id: z.string(),
  city_id: z.string(),
  district_id: z.string(),
  village_id: z.string(),
});

export class RecruiterRequestDto extends createZodDto(RecruiterRequestSchema) {}
