import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';
import { FeedbackFilterDto } from './dtos/feedback-filter.dto';

@Injectable()
export class FeedbacksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateFeedbackDto) {
    const existing = await this.prisma.feedback.findFirst({
      where: { user_id: userId },
    });

    if (existing) {
      throw new NotFoundException(
        'Anda sudah memberikan rating. Silakan ubah jika ingin memperbarui.',
      );
    }

    return this.prisma.feedback.create({
      data: {
        user_id: userId,
        message: dto.message,
        rating: dto.rating,
      },
    });
  }

  async findAll(query: FeedbackFilterDto) {
    const page = +(query.page ?? 1);
    const limit = +(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.FeedbackWhereInput = {
      ...(query.search && {
        OR: [
          {
            message: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            user: {
              username: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        ],
      }),
      ...(query.user_id && { user_id: query.user_id }),
      ...(query.rating && { rating: +query.rating }),
    };

    const feedbacks = await this.prisma.feedback.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image_url: true,
          },
        },
      },
    });

    const total = await this.prisma.feedback.count({ where });

    return {
      feedbacks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image_url: true,
          },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    return feedback;
  }

  async findByUserId(userId: string) {
    return this.prisma.feedback.findFirst({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            image_url: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    dto: UpdateFeedbackDto,
    currentUser: { id: string; role: string },
  ) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });

    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    const isOwner = feedback.user_id === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new NotFoundException(
        'Anda tidak memiliki izin untuk mengubah feedback ini',
      );
    }

    return this.prisma.feedback.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    const feedback = await this.prisma.feedback.findUnique({ where: { id } });
    if (!feedback) {
      throw new NotFoundException('Feedback tidak ditemukan');
    }

    await this.prisma.feedback.delete({ where: { id } });

    return { message: 'Feedback berhasil dihapus' };
  }
}
