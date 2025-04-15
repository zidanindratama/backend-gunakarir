import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SignInSchema = z.object({
  username: z
    .string({ required_error: 'Username wajib diisi' })
    .min(3, 'Username minimal 3 karakter'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(6, 'Password minimal 6 karakter'),
});

export const RegisterSchema = z
  .object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    role: z.enum(['MAHASISWA', 'RECRUITER']).default('MAHASISWA'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm_password: z
      .string()
      .min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password dan konfirmasi tidak cocok',
    path: ['confirmPassword'],
  });

export class SignInDto extends createZodDto(SignInSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
