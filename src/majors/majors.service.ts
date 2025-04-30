import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MajorFilterDto } from './dtos/major-filter.dto';
import { MajorCreateDto } from './dtos/major-create.dto';
import { MajorUpdateDto } from './dtos/major-update.dto';

@Injectable()
export class MajorsService {
  constructor(private prisma: PrismaService) {}

  async getAll(query: MajorFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.MajorWhereInput = {
      ...(query.search && {
        name: {
          contains: query.search,
          mode: 'insensitive',
        },
      }),
      ...(query.degree && {
        degree: query.degree,
      }),
    };

    const majors = await this.prisma.major.findMany({
      where,
      skip,
      take: limit,
      include: {
        studyProgram: true,
      },
    });

    const total = await this.prisma.major.count({ where });

    return {
      data: majors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const found = await this.prisma.major.findUnique({
      where: { id },
      include: { studyProgram: true },
    });
    if (!found) throw new NotFoundException('Jurusan tidak ditemukan');
    return found;
  }

  async create(data: MajorCreateDto) {
    return this.prisma.major.create({
      data: data as Prisma.MajorUncheckedCreateInput,
    });
  }

  async update(id: string, data: MajorUpdateDto) {
    return this.prisma.major.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.major.delete({ where: { id } });
  }
}
