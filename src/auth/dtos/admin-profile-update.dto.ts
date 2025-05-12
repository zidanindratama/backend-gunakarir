import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AdminProfileUpdateSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  image_url: z.string().url('URL gambar tidak valid').optional(),
});

export class AdminProfileUpdateDto extends createZodDto(
  AdminProfileUpdateSchema,
) {}
