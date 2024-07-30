import CredentialsProvider from "next-auth/providers/credentials";
import { createUserModel, User } from "@/server/models/user";
import { userService } from "@/server/services/firestore-server-services";
import { verifyIdToken } from "@/server/utils/verify-id-token";
import { isUserExpired } from "@/server/utils/verify-user-expired";
import { NextAuthOptions } from "next-auth";
import { Role } from "@/server/models/enum";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {},
      authorize: async (credentials: { idToken?: string } | undefined) => {
        if (!credentials?.idToken) return null;
        try {
          const decoded = await verifyIdToken(credentials.idToken);
          const userDoc = await userService.getDoc(decoded.uid);
          // Create a user model based on the decoded token
          // If the user exists in Firestore, use the existing user model
          const userModel = createUserModel(decoded, userDoc);

          if (!userDoc) {
            // If the user does not exist in Firestore, create a new user model
            // and save it to Firestore
            await userService.setDoc(decoded.uid, userModel);
          }

          const user = {
            ...userModel,
            // Check if the user is expired when they sign in
            // expired: isUserExpired(userModel.expired_date),
          }

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
    jwt: async ({ token, user, account, profile, isNewUser, trigger, session }: any) => {
      console.log("jwt callback", { token, user, account });
      if (trigger === "update" && session?.user) {
        console.log("session", session);
        Object.assign(token, session.user);
      }
      if (user) {
        token = { ...user }
      }
      // if (user) {
      //   // Check if the user is expired when they sign in
      //   if (isUserExpired(user.expired_date)) {
      //     console.warn("User subscription or trial period has expired.");
      //     return { ...token, expired: true };
      //   }
      //   return { ...token, ...user };
      // }
      return token;
    },
    session: ({ session, token, user }) => {
      //   console.log("user-session", user);
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        session.user.level = token.level;
        session.user.email_verified = token.email_verified;
        session.user.xp = token.xp;
        session.user.cefr_level = token.cefr_level;
        session.user.role = token.role;
      }
      // console.log("session callback");
      // console.log("session", session);
      return session;
    },
  },
};