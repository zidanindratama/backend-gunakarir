import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const validateApprovedMahasiswa = async (
  userId: string,
  prisma: PrismaService,
) => {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { user_id: userId },
  });

  if (!mahasiswa) {
    throw new ForbiddenException('Akun mahasiswa tidak ditemukan.');
  }

  if (mahasiswa.status !== 'APPROVED') {
    throw new ForbiddenException('Mahasiswa belum disetujui.');
  }
};
