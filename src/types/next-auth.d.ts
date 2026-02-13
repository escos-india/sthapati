import 'next-auth';
import 'next-auth/jwt';
import type { UserCategory, UserStatus } from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user?: Session['user'] & {
      googleId?: string;
      status?: UserStatus;
      category?: UserCategory;
      dbId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    googleId?: string;
    userStatus?: UserStatus | null;
    userCategory?: UserCategory | null;
    userDbId?: string | null;
  }
}

