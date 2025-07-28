
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from '@/types';
import { connectToDB } from "./mongoose";
import UserModel from "@/models/user.model";

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

        const { username, password, role } = credentials;

        if (role === 'admin') {
            const adminUsername = process.env.ADMIN_USERNAME || 'Admin01';
            const adminPassword = process.env.ADMIN_PASSWORD || 'shaosaid05413';
            
            if (username === adminUsername && password === adminPassword) {
               return {
                    id: 'admin_user_placeholder',
                    name: 'Admin User',
                    email: 'admin@mca-dept.edu',
                    role: 'admin'
                };
            }
            return null;
        }

        try {
            await connectToDB();
            const user = await UserModel.findOne({ name: username, role: role as Role }).select('+password');

            if (!user) {
              console.log(`User not found with username: ${username} and role: ${role}`);
              return null;
            }
            
            const isPasswordCorrect = user.password === password;

            if (!isPasswordCorrect) {
              console.log('Password incorrect for user:', username);
              return null;
            }

            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role as Role,
                classId: user.classId ? user.classId.toString() : undefined,
            };

          } catch (error) {
            console.error('Login error in authorize:', error);
            return null;
          }
      },
    }),
  ],
  pages: {
    signIn: '/login',
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
