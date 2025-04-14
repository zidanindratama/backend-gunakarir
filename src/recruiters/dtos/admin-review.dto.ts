import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AdminReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: z.string().optional(),
  })
  .refine(
    (data) => data.status !== 'REJECTED' || !!data.rejectionReason?.trim(),
    {
      message: 'Alasan penolakan wajib diisi jika status REJECTED',
      path: ['rejectionReason'],
    },
  );

export class AdminReviewDto extends createZodDto(AdminReviewSchema) {}
