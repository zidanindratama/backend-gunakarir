import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const FeedbackFilterSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).optional(),
  search: z.string().optional(),
  user_id: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});

export class FeedbackFilterDto extends createZodDto(FeedbackFilterSchema) {}
