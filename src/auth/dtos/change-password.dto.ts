import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: 'Password lama wajib diisi' })
    .min(6, 'Password lama minimal 6 karakter'),
  newPassword: z
    .string({ required_error: 'Password baru wajib diisi' })
    .min(6, 'Password baru minimal 6 karakter'),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
