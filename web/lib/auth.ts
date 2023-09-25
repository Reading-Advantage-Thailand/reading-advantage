import db from "@configs/firebaseConfig";
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET as string,
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/authentication',
        error: '/authentication/error',
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},
            async authorize(credentials, req) {
                let docId: string;
                let isEmail: boolean = false;
                let user;
                // check email or username
                if (req.body.emailOrUsername.includes("@")) {
                    isEmail = true;
                }
                if (isEmail) {
                    user = await db.collection("users")
                        .where("email", "==", req.body.emailOrUsername)
                        .get().then((querySnapshot) => {
                            if (querySnapshot.empty) {
                                throw new Error("Email not found");
                                // return null
                            } else {
                                docId = querySnapshot.docs[0].id
                                return querySnapshot.docs[0].data()
                            }
                        });
                } else {
                    user = await db.collection("users")
                        .where("username", "==", req.body.emailOrUsername)
                        .get().then((querySnapshot) => {
                            if (querySnapshot.empty) {
                                throw new Error("User not found");
                                // return null
                            } else {
                                docId = querySnapshot.docs[0].id
                                return querySnapshot.docs[0].data()
                            }
                        });
                }
                // check password
                if (user) {
                    const passwordMatch = await bcryptjs.compare(req.body.password, user.password);
                    if (!passwordMatch) {
                        throw new Error("Password not match");
                        // return null
                    }
                }
                if (user) {
                    return {
                        id: docId,
                        username: user.username,
                        email: user.email || "",
                        image: user.image,
                        level: user.level || 0,
                        fLang: user.fLang,
                    }
                } else {
                    throw new Error("User not found");
                    // return null
                }
            }

        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                // token.id = user.id
                token.userLevel = user.level
            }
            if (trigger === "update" && session?.level) {
                // token.id = user.id
                token.userLevel = session.level
            }
            return token
        },
        async session({ session, token }) {
            // session.id = token.id
            session.level = token.userLevel
            return session
        },
    },
}
