import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const validateApprovedRecruiter = async (
  userId: string,
  prisma: PrismaService,
) => {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId },
  });

  if (!recruiter) {
    throw new ForbiddenException('Akun recruiter tidak ditemukan.');
  }

  if (recruiter.status !== 'APPROVED') {
    throw new ForbiddenException('Recruiter belum disetujui.');
  }
};
