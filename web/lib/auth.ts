import db from "@/configs/firestore-config"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { firebaseAdmin } from "./firebaseAdmin"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            credentials: {},
            authorize: async (credentials: { idToken?: string } | undefined, _req) => {
                if (credentials && credentials.idToken) {
                    try {
                        const decoded = await firebaseAdmin.auth().verifyIdToken(credentials.idToken);
                        // console.log('decoded', decoded);
                        // Convert the decoded token to a User object
                        const user = {
                            id: decoded.uid,
                            name: decoded.name,
                            email: decoded.email,
                            image: decoded.picture,
                        };
                        console.log('user', user);
                        return user;
                    } catch (err) {
                        console.error(err);
                        return Promise.resolve(null);
                    }
                }
                return Promise.resolve(null);
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        'signIn': '/auth/signin',
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        jwt: async ({ token }) => {
            try {
                console.log('token', token);
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
                            level: 0,
                        });
                }
                return token;
            } catch (error) {
                return Promise.reject(error);
            }
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
    }
};