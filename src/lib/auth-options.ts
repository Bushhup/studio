
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
          throw new Error("Invalid credentials provided.");
        }

        try {
            const loginResult = await loginAction({ 
                username: credentials.username, 
                password: credentials.password, 
                role: credentials.role as Role 
            });

            if (loginResult.success) {
                // If login is successful, fetch the complete user details to return to NextAuth
                const user = await getUserDetails(credentials.username, credentials.role as Role);
                
                if (user) {
                    // Return the user object for NextAuth to use
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        classId: user.classId,
                    };
                } else {
                     // This case should ideally not happen if login succeeds, but as a safeguard:
                    throw new Error("Login succeeded but user details could not be found.");
                }
            } else {
                // If loginAction returns success: false, throw an error with the message
                throw new Error(loginResult.message || "Invalid credentials.");
            }
        } catch (error) {
            // Catch any errors thrown from loginAction or getUserDetails
            // and re-throw them so NextAuth can display them to the user.
            const errorMessage = (error instanceof Error) ? error.message : "An unknown authentication error occurred.";
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
