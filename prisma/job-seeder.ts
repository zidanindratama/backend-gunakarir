import { PrismaClient, JobType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const recruiterId = '681d65f2e1f21cad9878a636';

  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(now.getMonth() + 1);

  const jobs = [
    {
      title: 'Frontend Developer Intern',
      short_description: 'Membantu tim UI dalam membangun antarmuka web.',
      full_description:
        'Kandidat akan bekerja sama dengan tim frontend menggunakan React dan TailwindCSS.',
      salary: 2000000,
      quota: 2,
      type: JobType.INTERNSHIP,
    },
    {
      title: 'Backend Engineer',
      short_description: 'Bangun dan rawat API backend menggunakan NodeJS.',
      full_description:
        'Mengembangkan layanan backend dengan NestJS dan MongoDB.',
      salary: 6000000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'UI/UX Designer',
      short_description: 'Desain produk aplikasi berbasis mobile dan web.',
      full_description:
        'Menggunakan Figma untuk prototyping dan user research.',
      salary: 5000000,
      quota: 1,
      type: JobType.CONTRACT,
    },
    {
      title: 'Data Analyst',
      short_description: 'Analisa data pengguna dan buat laporan.',
      full_description:
        'Mengolah data menggunakan SQL dan visualisasi dengan Power BI.',
      salary: 5500000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'Digital Marketing Specialist',
      short_description: 'Kembangkan strategi pemasaran digital.',
      full_description: 'Menangani kampanye SEO, SEM, dan media sosial.',
      salary: 4000000,
      quota: 2,
      type: JobType.PART_TIME,
    },
    {
      title: 'Mobile Developer',
      short_description: 'Bangun aplikasi Flutter untuk Android & iOS.',
      full_description:
        'Kandidat akan bekerja dengan tim frontend dan backend.',
      salary: 6500000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'Content Writer',
      short_description: 'Tulis artikel dan konten website.',
      full_description: 'Konten mencakup blog, SEO page, dan edukasi produk.',
      salary: 3000000,
      quota: 2,
      type: JobType.FREELANCE,
    },
    {
      title: 'Project Manager',
      short_description: 'Kelola proyek teknologi dari awal hingga selesai.',
      full_description:
        'Menggunakan metode Agile dan koordinasi tim lintas departemen.',
      salary: 8000000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'IT Support',
      short_description: 'Menangani masalah teknis harian.',
      full_description:
        'Install, troubleshoot dan konfigurasi perangkat lunak.',
      salary: 3500000,
      quota: 2,
      type: JobType.FULL_TIME,
    },
    {
      title: 'Graphic Designer',
      short_description: 'Buat materi visual untuk brand.',
      full_description: 'Gunakan Adobe Illustrator dan Photoshop.',
      salary: 4500000,
      quota: 1,
      type: JobType.CONTRACT,
    },
    {
      title: 'SEO Specialist',
      short_description: 'Optimasi visibilitas situs di mesin pencari.',
      full_description: 'Analisa performa kata kunci dan struktur situs.',
      salary: 5000000,
      quota: 1,
      type: JobType.FREELANCE,
    },
    {
      title: 'Video Editor',
      short_description: 'Edit video untuk promosi dan konten sosial media.',
      full_description: 'Gunakan Adobe Premiere dan After Effects.',
      salary: 4000000,
      quota: 1,
      type: JobType.PART_TIME,
    },
    {
      title: 'Network Engineer',
      short_description: 'Setup dan maintenance jaringan internal.',
      full_description: 'Monitor dan perbaiki masalah konektivitas.',
      salary: 7000000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'Quality Assurance',
      short_description: 'Tes dan evaluasi kualitas perangkat lunak.',
      full_description: 'Gunakan manual dan automation testing tools.',
      salary: 5500000,
      quota: 1,
      type: JobType.FULL_TIME,
    },
    {
      title: 'Customer Service',
      short_description: 'Layani pengguna dengan ramah dan cepat.',
      full_description: 'Menangani pertanyaan, keluhan, dan panduan teknis.',
      salary: 3500000,
      quota: 3,
      type: JobType.PART_TIME,
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({
      data: {
        recruiter_id: recruiterId,
        title: job.title,
        short_description: job.short_description,
        full_description: job.full_description,
        salary: job.salary,
        quota: job.quota,
        application_start: now,
        application_end: nextMonth,
        status: true,
        province_id: 'JAWA_BARAT',
        city_id: 'KOTA_BEKASI',
        type: job.type,
        created_at: now,
        updated_at: now,
      },
    });
  }

  console.log('✅ 15 pekerjaan berhasil di-seed!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
