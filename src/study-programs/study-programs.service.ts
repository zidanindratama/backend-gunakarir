import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudyProgramFilterDto } from './dtos/study-program-filter.dto';

@Injectable()
export class StudyProgramsService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: StudyProgramFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.StudyProgramWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const studyPrograms = await this.prisma.studyProgram.findMany({
      where,
      skip,
      take: limit,
      include: {
        majors: true,
      },
      orderBy: {
        created_at: query.sortBy === 'name' ? 'asc' : 'desc',
      },
    });

    const total = await this.prisma.studyProgram.count({ where });

    return {
      data: studyPrograms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const found = await this.prisma.studyProgram.findUnique({
      where: { id },
      include: { majors: true },
    });
    if (!found) throw new NotFoundException('Fakultas tidak ditemukan');
    return found;
  }

  async create(data: { name: string }) {
    return this.prisma.studyProgram.create({ data });
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.studyProgram.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.studyProgram.delete({ where: { id } });
  }
}
