import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z
    .string({ required_error: 'Token reset wajib diisi' })
    .min(1, 'Token tidak boleh kosong'),
  new_password: z
    .string({ required_error: 'Password baru wajib diisi' })
    .min(6, 'Password baru minimal 6 karakter'),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
