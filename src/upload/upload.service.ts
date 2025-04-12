import { Inject, Injectable } from '@nestjs/common';
import { v2 as CloudinaryType, UploadApiResponse } from 'cloudinary';
import { CLOUDINARY } from 'src/constants/cloudinary.constants';

@Injectable()
export class UploadService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'image',
            folder: 'guna_karir/images',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadPdf(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const fileName = file.originalname.split('.')[0];

      this.cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'raw',
            folder: 'guna_karir/pdfs',
            public_id: `${fileName}.pdf`,
            access_mode: 'public',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
