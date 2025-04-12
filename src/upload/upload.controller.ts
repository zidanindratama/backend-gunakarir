import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Public } from '../common/decorators/public.decorator';

@Public()
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadFile(
    @Query('type') type: 'image' | 'pdf',
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    if (type === 'image') {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
        throw new BadRequestException(
          'Invalid image type. Only JPG, JPEG, PNG, and WEBP are allowed.',
        );
      }
      return this.uploadService.uploadImage(file);
    }

    if (type === 'pdf') {
      if (file.mimetype !== 'application/pdf') {
        throw new BadRequestException(
          'Invalid file type. Only PDF is allowed.',
        );
      }
      return this.uploadService.uploadPdf(file);
    }

    throw new BadRequestException('Invalid type. Use ?type=image or ?type=pdf');
  }
}
