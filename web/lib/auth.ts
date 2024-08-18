import CredentialsProvider from "next-auth/providers/credentials";
import { createUserModel } from "@/server/models/user";
import { userService } from "@/server/services/firestore-server-services";
import { verifyIdToken } from "@/server/utils/verify-id-token";
import { NextAuthOptions } from "next-auth";
import { isUserExpired } from "@/server/utils/verify-user-expired";
import exp from "constants";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {},
      authorize: async (credentials: { idToken?: string } | undefined) => {
        if (!credentials?.idToken) return null;
        try {
          const decoded = await verifyIdToken(credentials.idToken);
          const userDoc = await userService.users.getDoc(decoded.uid);
          // Create a user model based on the decoded token
          // If the user exists in Firestore, use the existing user model
          const userModel = createUserModel(decoded, userDoc);

          if (!userDoc) {
            // If the user does not exist in Firestore, create a new user model
            // and save it to Firestore
            await userService.users.setDoc(decoded.uid, userModel);
          }

          const user = {
            ...userModel,
            // Check if the user is expired when they sign in
            // expired: isUserExpired(userModel.expired_date),
          };

          return user;
        } catch (error) {
          console.error("error in credentials provider:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async session({ token, session }) {
      console.log("session token", token);
      if (token) {
        session.user.id = token.id
        session.user.display_name = token.display_name
        session.user.email = token.email
        session.user.picture = token.picture

        // Custom properties
        session.user.role = token.role
        session.user.expired = token.expired
        session.user.level = token.level
        session.user.expired = token.expired
        session.user.xp = token.xp
        session.user.cefr_level = token.cefr_level
        session.user.email_verified = token.email_verified
        session.user.expired_date = token.expired_date
      }
      return session
    },
    jwt: async ({ token, user, account, profile, isNewUser, trigger, session }: any) => {
      const dbUser = await userService.users.getDoc(token.id);
      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token
      }
      if (user) {
        token.id = user?.id
      }

      // Custom properties
      token = {
        expired: isUserExpired(dbUser.expired_date) || dbUser.expired_date === "",
        // expired: false,
        id: dbUser.id,
        display_name: dbUser.display_name,
        email: dbUser.email,
        picture: profile?.picture || dbUser.picture,
        level: dbUser.level,
        email_verified: dbUser.email_verified,
        xp: dbUser.xp,
        cefr_level: dbUser.cefr_level,
        role: dbUser.role,
        expired_date: dbUser.expired_date,
      }
      // console.log("jwt token", token);
      return {
        ...token,
      }
    },
  },
};
