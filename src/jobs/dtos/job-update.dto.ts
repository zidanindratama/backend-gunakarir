import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateJobSchema = z
  .object({
    title: z.string().min(1).optional(),
    short_description: z.string().min(1).optional(),
    full_description: z.string().min(1).optional(),
    salary: z.coerce.number().min(0).optional(),
    quota: z.coerce.number().min(1).optional(),

    application_start: z.coerce.date().optional(),
    application_end: z.coerce.date().optional(),

    province_id: z.string().min(1).optional(),
    city_id: z.string().min(1).optional(),

    major_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      !data.application_start ||
      !data.application_end ||
      data.application_end >= data.application_start,
    {
      path: ['application_end'],
      message: 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai',
    },
  );

export class UpdateJobDto extends createZodDto(UpdateJobSchema) {}
