import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    id: string;
    username: string;
    email: string;
    image: string;
    level: number;
    fLang: string;
  }

  interface User {
    id: string;
    username: string;
    email: string;
    image: string;
    level: number;
    fLang: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    userLevel?: number,
    id: string;
  }
}
