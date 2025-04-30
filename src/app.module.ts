import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { MailerModule } from './mailer/mailer.module';
import { UploadModule } from './upload/upload.module';
import { RecruitersModule } from './recruiters/recruiters.module';
import { StudentsModule } from './students/students.module';
import { StudyProgramsModule } from './study-programs/study-programs.module';
import { MajorsModule } from './majors/majors.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    AuthModule,
    PrismaModule,
    MailerModule,
    UploadModule,
    RecruitersModule,
    StudentsModule,
    StudyProgramsModule,
    MajorsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
