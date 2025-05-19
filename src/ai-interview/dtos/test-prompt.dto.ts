import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const TestPromptSchema = z.object({
  question: z.string().min(1),
});

export class TestPromptDto extends createZodDto(TestPromptSchema) {}
