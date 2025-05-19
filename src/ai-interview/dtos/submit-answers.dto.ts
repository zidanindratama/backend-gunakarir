import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SubmitAnswersSchema = z.object({
  answers: z.array(
    z
      .object({
        questionId: z.string(),
        answer: z.string(),
      })
      .strict(),
  ),
});

export class SubmitAnswersDto extends createZodDto(SubmitAnswersSchema) {}
export type SubmitAnswersType = z.infer<typeof SubmitAnswersSchema>;
