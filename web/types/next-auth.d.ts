import { User as NextAuthUser } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;

        // Custom properties
        role: Role;
        expired: boolean;
        level: number;
        xp: number;
        cefr_level: string;
        display_name: string;
        email_verified: boolean;
        picture: string;
        expired_date: string;
    }
}

declare module "next-auth" {
    interface User {
        id: string;

        // Custom properties
        role: Role;
        expired: boolean;
        level: number;
        xp: number;
        cefr_level: string;
        display_name: string;
        email_verified: boolean;
        picture: string;
        expired_date: string;
    }

    interface Session {
        user: User;
    }
}