import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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
