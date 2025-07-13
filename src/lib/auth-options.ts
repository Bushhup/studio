
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
          throw new Error("Invalid credentials provided.");
        }

        try {
            const user = await loginAction({ 
                username: credentials.username, 
                password: credentials.password, 
                role: credentials.role as Role 
            });

            if (user) {
                // The login action now returns the full user object on success.
                // This object, including the id, is returned to NextAuth.
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    classId: user.classId,
                };
            } else {
                // If loginAction returns null, it means authentication failed.
                // Return null to indicate failure to NextAuth, which then sets the error message.
                return null;
            }
        } catch (error) {
            // Catch any other unexpected errors during the login process.
            const errorMessage = (error instanceof Error) ? error.message : "An unknown authentication error occurred.";
            // Throwing an error here will also signal a login failure to NextAuth.
            throw new Error(errorMessage);
        }
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
      // When a user signs in, the `user` object is available from authorize.
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
