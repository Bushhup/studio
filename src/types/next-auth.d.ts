
import NextAuth, { DefaultSession } from "next-auth";
import { Role } from ".";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      classId?: string;
    } & DefaultSession["user"];
  }

   interface User {
    role: Role;
    classId?: string;
  }
}
