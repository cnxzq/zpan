import 'express';
import 'cookie-session';
import type { UserRole, UserPermission } from '../config/schema';

declare module 'express' {
  interface Request {
    user?: {
      username: string;
      role: UserRole;
      permission: UserPermission;
      rootDir: string;
    };
  }
}

declare module 'cookie-session' {
  interface CookieSessionObject {
    loggedIn?: boolean;
    username?: string;
  }
}
