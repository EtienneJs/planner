// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { api } from "@/lib/api/response";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    redirect({ baseUrl }) {
      return `${baseUrl}/api/auth/session`;
    },
    jwt: ({ token, user }) => {
      if (user) token.id = user.id;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
export async function getAuthUser(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) return {error:"INVALID_SESION"};

  const userExists = await db.user.findUnique({ where: { id: token.id } });
  if (!userExists) return{error:"USER_NO_EXIST"}

  return {
    id: token.id,
    email: token.email as string | undefined,
  };
}

/** Retorna el usuario autenticado o la Response 401. Uso: const user = await requireAuth(req); if (user instanceof Response) return user; */
export async function requireAuth(
  req: NextRequest
): Promise<{ id: string; email?: string } | Response> {
  const user = await getAuthUser(req);
  if (!user || "error" in user) {
    return api.unauthorized(
      (user && "error" in user ? user.error : "Sesión inválida") as string
    );
  }
  return user;
}