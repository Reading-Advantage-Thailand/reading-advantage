import CredentialsProvider from "next-auth/providers/credentials";
import { createUserModel } from "@/server/models/user";
import { userService } from "@/server/services/firestore-server-services";
import { verifyIdToken } from "@/server/utils/verify-id-token";
import { NextAuthOptions } from "next-auth";

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
    jwt: async ({
      token,
      user,
      account,
      profile,
      isNewUser,
      trigger,
      session,
    }: any) => {
      const dbUser = await userService.getDoc(token.id);
      if (!dbUser) {
        if (user) {
          token.id = user?.id;
          token.role = user?.role;
          token.level = user?.level;
        }
        return token;
      }
      return {
        id: dbUser.id,
        display_name: dbUser.display_name,
        email: dbUser.email,
        picture: token.picture || dbUser.picture,
        level: dbUser.level,
        email_verified: dbUser.email_verified,
        xp: dbUser.xp,
        cefr_level: dbUser.cefr_level,
        role: dbUser.role,
        expired_date: dbUser.expired_date,
        license_id: dbUser.license_id,
        onborda: dbUser.onborda,
      };
    },
    session: ({ session, token, user }) => {
      // console.log("session", session);
      // console.log("token", token);
      if (token) {
        session.user.id = token.id;
        session.user.display_name = token.display_name;
        session.user.email = token.email;
        session.user.picture = token.picture;
        session.user.level = token.level;
        session.user.email_verified = token.email_verified;
        session.user.xp = token.xp;
        session.user.cefr_level = token.cefr_level;
        session.user.role = token.role;
        session.user.expired_date = token.expired_date;
        session.user.license_id = token.license_id;
        session.user.onborda = token.onborda;
      }
      return session;
    },
  },
};
