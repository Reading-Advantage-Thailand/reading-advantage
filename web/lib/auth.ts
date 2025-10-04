import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PasswordUtils } from "@/lib/password-utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: false,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            return null;
          }
          let isValidPassword = false;

          if (user.password) {
            if (PasswordUtils.isHashed(user.password)) {
              isValidPassword = await PasswordUtils.comparePassword(
                credentials.password,
                user.password
              );
            } else {
              isValidPassword = user.password === credentials.password;
            }
          }

          if (!isValidPassword) {
            return null;
          }

          const currentDate = new Date();
          const isExpired = user.expiredDate
            ? user.expiredDate < currentDate
            : false;

          const licenseLevel = isExpired 
            ? "EXPIRED" as const
            : user.licenseId 
              ? "BASIC" as const
              : "EXPIRED" as const;

          const returnUser = {
            id: user.id,
            email: user.email,
            display_name: user.name ?? "",
            role: user.role,
            level: user.level,
            email_verified: !!user.emailVerified,
            picture: user.image ?? "",
            xp: user.xp,
            cefr_level: user.cefrLevel ?? "",
            expired_date: user.expiredDate?.toISOString() ?? "",
            expired: isExpired,
            license_id: user.licenseId ?? "",
            onborda: user.onborda ?? false,
            license_level: licenseLevel,
          };

          return returnUser;
        } catch (error) {
          console.error("AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google") {
        return true;
      }
      if (account?.provider === "credentials") {
        return true;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.display_name = user.display_name;
        token.role = user.role;
        token.level = user.level;
        token.email_verified = user.email_verified;
        token.picture = user.picture;
        token.xp = user.xp;
        token.cefr_level = user.cefr_level;
        token.expired_date = user.expired_date;
        token.expired = user.expired;
        token.license_id = user.license_id;
        token.onborda = user.onborda;
        token.license_level = user.license_level;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.display_name = token.display_name;
        session.user.role = token.role;
        session.user.level = token.level;
        session.user.email_verified = token.email_verified;
        session.user.picture = token.picture;
        session.user.xp = token.xp;
        session.user.cefr_level = token.cefr_level;
        session.user.expired_date = token.expired_date;
        session.user.expired = token.expired;
        session.user.license_id = token.license_id;
        session.user.onborda = token.onborda;
        session.user.license_level = token.license_level;
      }
      return session;
    },
  },
};
