import db from "@/configs/firestore-config"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: '1090865515742-nnj4vikfak8beedqf5nnhd5ahllv9moi.apps.googleusercontent.com',
            clientSecret: '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',
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        'signIn': '/login',
    },
    jwt: {
        secret: 'readingsecretadvantagebangkok',
    },
    callbacks: {
        jwt: async ({ token }) => {
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
            }
            return session;
        },
    },
};