import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const UpdateFeedbackSchema = z.object({
  message: z.string().min(5).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export class UpdateFeedbackDto extends createZodDto(UpdateFeedbackSchema) {}
