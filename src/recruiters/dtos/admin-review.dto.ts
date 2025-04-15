import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const AdminReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejection_reason: z.string().optional(),
  })
  .refine(
    (data) => data.status !== 'REJECTED' || !!data.rejection_reason?.trim(),
    {
      message: 'Alasan penolakan wajib diisi jika status REJECTED',
      path: ['rejectionReason'],
    },
  );

export class AdminReviewDto extends createZodDto(AdminReviewSchema) {}
