import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  old_password: z
    .string({ required_error: 'Password lama wajib diisi' })
    .min(6, 'Password lama minimal 6 karakter'),
  new_password: z
    .string({ required_error: 'Password baru wajib diisi' })
    .min(6, 'Password baru minimal 6 karakter'),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
