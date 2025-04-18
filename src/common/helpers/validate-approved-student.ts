import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const validateApprovedStudent = async (
  userId: string,
  prisma: PrismaService,
) => {
  const student = await prisma.student.findUnique({
    where: { user_id: userId },
  });

  if (!student) {
    throw new ForbiddenException('Akun mahasiswa tidak ditemukan.');
  }

  if (student.status !== 'APPROVED') {
    throw new ForbiddenException('Mahasiswa belum disetujui.');
  }
};
