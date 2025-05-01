import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FacultyFilterDto } from './dtos/faculty-filter.dto';

@Injectable()
export class FacultiesService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: FacultyFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.FacultyWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        }
      : {};

    const studyPrograms = await this.prisma.faculty.findMany({
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

    const total = await this.prisma.faculty.count({ where });

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
    const found = await this.prisma.faculty.findUnique({
      where: { id },
      include: { majors: true },
    });
    if (!found) throw new NotFoundException('Fakultas tidak ditemukan');
    return found;
  }

  async create(data: { name: string }) {
    return this.prisma.faculty.create({ data });
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.faculty.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.faculty.delete({ where: { id } });
  }
}
