import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error(`[${request.method}] ${request.url} >>`, exception);

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        error: 'Bad Request',
      });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      let message = 'Terjadi kesalahan pada database';
      let statusCode = HttpStatus.BAD_REQUEST;

      if (exception.code === 'P2002') {
        const target = exception.meta?.target;
        const rawField = Array.isArray(target) ? target[0] : String(target);
        const match = rawField.match(/_(.*?)_key$/);
        const fieldName = match ? match[1] : rawField;

        message = `${fieldName.toUpperCase()} sudah digunakan.`;
      }

      if (exception.code === 'P2025') {
        message = 'Data yang diminta tidak ditemukan.';
        statusCode = HttpStatus.NOT_FOUND;
      }

      return response.status(statusCode).json({
        statusCode,
        message,
        error: 'Bad Request',
      });
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const message = exception.getResponse();
      return response.status(statusCode).json({
        statusCode,
        message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
