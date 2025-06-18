import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateFeedbackSchema = z.object({
  message: z.string().min(5, 'Pesan umpan balik minimal 5 karakter'),
  rating: z
    .number({
      required_error: 'Rating harus diisi',
      invalid_type_error: 'Rating harus berupa angka',
    })
    .min(1, 'Minimal bintang 1')
    .max(5, 'Maksimal bintang 5'),
});

export class CreateFeedbackDto extends createZodDto(CreateFeedbackSchema) {}
