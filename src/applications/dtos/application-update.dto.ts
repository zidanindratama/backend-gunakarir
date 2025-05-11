import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ApplicationStatus } from '@prisma/client';

export const ApplicationUpdateSchema = z.object({
  status: z
    .nativeEnum(ApplicationStatus, {
      errorMap: () => ({ message: 'Status tidak valid' }),
    })
    .optional(),
});

export class ApplicationUpdateDto extends createZodDto(
  ApplicationUpdateSchema,
) {}
