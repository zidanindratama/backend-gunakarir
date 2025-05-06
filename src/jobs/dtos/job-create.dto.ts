import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateJobSchema = z
  .object({
    title: z.string().min(1, 'Judul wajib diisi'),
    short_description: z.string().min(1, 'Deskripsi singkat wajib diisi'),
    full_description: z.string().min(1, 'Deskripsi lengkap wajib diisi'),
    salary: z.coerce
      .number()
      .min(0, 'Gaji wajib diisi dan tidak boleh negatif'),
    quota: z.coerce.number().min(1, 'Kuota wajib diisi dan minimal 1'),

    application_start: z.coerce.date({
      invalid_type_error: 'Tanggal mulai lamar tidak valid',
    }),
    application_end: z.coerce.date({
      invalid_type_error: 'Tanggal akhir lamar tidak valid',
    }),
    status: z.boolean(),

    province_id: z.string().min(1, 'Provinsi wajib diisi'),
    city_id: z.string().min(1, 'Kota/Kabupaten wajib diisi'),

    type: z
      .enum([
        'FULL_TIME',
        'PART_TIME',
        'INTERNSHIP',
        'CONTRACT',
        'FREELANCE',
        'TEMPORARY',
      ])
      .default('FULL_TIME'),

    major_ids: z.array(z.string()).optional(),
  })
  .refine((data) => data.application_end >= data.application_start, {
    path: ['application_end'],
    message: 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai',
  });

export class CreateJobDto extends createZodDto(CreateJobSchema) {}
