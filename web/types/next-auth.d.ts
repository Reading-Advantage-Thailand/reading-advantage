import { User as NextAuthUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";
import { Role } from "@/server/models/enum";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    display_name: string;
    role: Role.USER;
    level: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level: string;
    expired_date: string;
    expired?: boolean;
    license_id?: string;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      email: string;
      display_name: string;
      role: Role;
      level: number;
      email_verified: boolean;
      picture: string;
      xp: number;
      cefr_level: string;
      expired_date: string;
      expired?: boolean;
      license_id?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    display_name: string;
    role: Role;
    level: number;
    email_verified: boolean;
    picture: string;
    xp: number;
    cefr_level: string;
    expired_date: string;
    expired?: boolean;
    license_id?: string;
  }
}
