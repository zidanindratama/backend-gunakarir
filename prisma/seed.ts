import { PrismaClient, EducationDegree } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const studyPrograms = [
    {
      name: 'Ilmu Komputer dan Teknologi Informasi',
      majors: [
        { name: 'Sistem Informasi', degree: 'S1' },
        { name: 'Sistem Komputer', degree: 'S1' },
        { name: 'Manajemen Informatika', degree: 'D3' },
        { name: 'Teknik Komputer', degree: 'D3' },
        { name: 'Manajemen Sistem Informasi', degree: 'S2' },
        { name: 'Teknologi Informasi', degree: 'S3' },
      ],
    },
    {
      name: 'Teknologi Industri',
      majors: [
        { name: 'Teknik Informatika', degree: 'S1' },
        { name: 'Teknik Elektro', degree: 'S1' },
        { name: 'Teknik Mesin', degree: 'S1' },
        { name: 'Teknik Industri', degree: 'S1' },
        { name: 'Agroteknologi', degree: 'S1' },
        { name: 'Teknik Elektro', degree: 'S2' },
        { name: 'Teknik Mesin', degree: 'S2' },
      ],
    },
    {
      name: 'Ekonomi',
      majors: [
        { name: 'Akuntansi', degree: 'S1' },
        { name: 'Manajemen', degree: 'S1' },
        { name: 'Ekonomi Syariah', degree: 'S1' },
        { name: 'Manajemen Keuangan', degree: 'D3' },
        { name: 'Manajemen Pemasaran', degree: 'D3' },
        { name: 'Manajemen', degree: 'S2' },
        { name: 'Ilmu Ekonomi', degree: 'S3' },
      ],
    },
    {
      name: 'Teknik Sipil dan Perencanaan',
      majors: [
        { name: 'Teknik Sipil', degree: 'S1' },
        { name: 'Arsitektur', degree: 'S1' },
        { name: 'Desain Interior', degree: 'S1' },
        { name: 'Teknik Sipil', degree: 'S2' },
        { name: 'Arsitektur', degree: 'S2' },
      ],
    },
    {
      name: 'Psikologi',
      majors: [
        { name: 'Psikologi', degree: 'S1' },
        { name: 'Psikologi', degree: 'S2' },
        { name: 'Psikologi Profesi', degree: 'S2' },
        { name: 'Ilmu Psikologi', degree: 'S3' },
      ],
    },
    {
      name: 'Sastra',
      majors: [
        { name: 'Sastra Inggris', degree: 'S1' },
        { name: 'Sastra Tiongkok', degree: 'S1' },
        { name: 'Pariwisata', degree: 'S1' },
        { name: 'Sastra Inggris', degree: 'S2' },
      ],
    },
    {
      name: 'Kedokteran',
      majors: [{ name: 'Kedokteran', degree: 'S1' }],
    },
    {
      name: 'Farmasi',
      majors: [{ name: 'Farmasi', degree: 'S1' }],
    },
    {
      name: 'Ilmu Komunikasi',
      majors: [{ name: 'Ilmu Komunikasi', degree: 'S1' }],
    },
  ];

  for (const program of studyPrograms) {
    const createdProgram = await prisma.studyProgram.upsert({
      where: { name: program.name },
      update: {},
      create: {
        name: program.name,
        created_at: now,
      },
    });

    for (const major of program.majors) {
      await prisma.major.upsert({
        where: { name: major.name },
        update: {},
        create: {
          name: major.name,
          degree: major.degree as EducationDegree,
          study_program_id: createdProgram.id,
          created_at: now,
        },
      });
    }
  }

  console.log('✅ Seed data berhasil dimasukkan tanpa duplikat!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
