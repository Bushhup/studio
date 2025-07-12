
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login as loginAction, getUserDetails } from '@/app/actions';
import type { Role, User } from '@/types';

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

        const result = await loginAction({ 
          username: credentials.username, 
          password: credentials.password, 
          role: credentials.role as Role 
        });

        if (result.success) {
          // Fetch user details to store in the session
          const user = await getUserDetails(credentials.username, credentials.role as Role);
          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              classId: user.classId,
            };
          }
        }
        return null; // Return null if authentication fails
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
      // When a user signs in, the `user` object is available.
      // We persist the user's role and id to the token.
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.classId = (user as any).classId;
      }
      return token;
    },
    async session({ session, token }) {
      // We pass the role and id from the token to the session object,
      // so it's available on the client side.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.classId = token.classId as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your .env file
};

export const auth = () => getServerSession(authOptions);
