import db from "@configs/firebaseConfig";
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs";

const handler = NextAuth({
    secret: process.env.NEXTAUTH_SECRET as string,
    pages: {
        signIn: '/authentication',
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {},
            async authorize(credentials, req) {
                let docId;
                const user = await db.collection("users")
                    .where("email", "==", req.body.email)
                    .get().then((querySnapshot) => {
                        if (querySnapshot.empty) {
                            return null
                        } else {
                            docId = querySnapshot.docs[0].id
                            return querySnapshot.docs[0].data()
                        }
                    });

                // check password
                if (user) {
                    const passwordMatch = await bcryptjs.compare(req.body.password, user.password);
                    if (!passwordMatch) {
                        return null
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
                    return null
                }
            }

        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id
                token.userLevel = user.level
            }
            if (trigger === "update" && session?.level) {
                // token.id = user.id
                token.userLevel = session.level
            }
            return token
        },
        async session({ session, token }) {
            session.id = token.id
            session.level = token.userLevel
            return session
        }
    },
});
export { handler as GET, handler as POST };