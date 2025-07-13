
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login as loginAction } from '@/app/actions';
import type { Role } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.role || !credentials.username || !credentials.password) {
          return null;
        }

        const user = await loginAction({ 
            username: credentials.username, 
            password: credentials.password, 
            role: credentials.role as Role 
        });

        if (user) {
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                classId: user.classId,
            };
        }
        
        // If loginAction returns null, authentication failed.
        // Return null to indicate failure to NextAuth.
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/', // Redirect users to the root page for login
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.classId = (user as any).classId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.classId = token.classId as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);
