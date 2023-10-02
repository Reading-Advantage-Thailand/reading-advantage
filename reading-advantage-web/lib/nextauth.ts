import { db } from "@/configs/firestore-config";
import { type NextAuthOptions, type DefaultSession, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type UserId = string

declare module "next-auth/jwt" {
    interface JWT {
        id: UserId
        name: string
        email: string
        picture: string
        level: number
    }
}

declare module "next-auth" {
    interface Session {
        user: User & {
            id: UserId,
            level: number,
            name: string,
            email: string,
            image: string,
        },
    }
}
export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        'signIn': 'en/auth/login',
        'signOut': 'en/auth/logout',
        'error': 'en/auth/error',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        jwt: async ({ token }) => {
            // console.log("jwt callback");
            // console.log('token', token);
            const user = await db.collection("users")
                .doc(token.sub as string)
                .get();
            const userData = user.data();

            if (userData) {
                token.id = userData.id;
                token.name = userData.name;
                token.email = userData.email;
                token.picture = userData.picture;
                token.level = userData.level;
            }
            // create account if it doesn't exist
            else {
                await db.collection("users")
                    .doc(token.sub as string)
                    .set({
                        id: token.sub,
                        name: token.name,
                        email: token.email,
                        picture: token.picture,
                        createAt: new Date(),
                        lastLogin: new Date(),
                        level: 0,
                    });
            }
            return token;
        },
        session: ({ session, token }) => {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
                session.user.level = token.level;
            }
            // console.log("session callback");
            console.log('session', session);
            return session;
        },
    },
};