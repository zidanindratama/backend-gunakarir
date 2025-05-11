import { z } from 'zod';
import { InterviewMethod, InterviewType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const InterviewCreateSchema = z.object({
  schedule: z.coerce.date(),
  confirm_deadline: z.coerce.date(),
  method: z.nativeEnum(InterviewMethod),
  type: z.nativeEnum(InterviewType),
  link: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export class InterviewCreateDto extends createZodDto(InterviewCreateSchema) {}
