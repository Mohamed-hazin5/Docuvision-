
import NextAuth, { type DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log("Auth attempt for:", credentials?.username);
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.username });
                console.log("User found in DB:", !!user);

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                console.log("Password valid:", isValid);

                if (!isValid) {
                    return null;
                }

                return { id: user._id.toString(), name: user.name, email: user.email };
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }: any) {
            if (session?.user) {
                session.user.id = token.sub;
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
