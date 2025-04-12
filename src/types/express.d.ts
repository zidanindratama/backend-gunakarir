import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends Pick<PrismaUser, 'id' | 'username' | 'role'> {}

    interface Request {
      user?: User;
      logout(callback: (err: any) => void): void;
    }
  }
}
