import NextAuth, { type NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development", // 開発時のみデバッグログを有効化
  providers: [
    LineProvider({
      clientId: "2007979395",
      clientSecret: "873845d7b4564e86374461b9220842b8",
      authorization: {
        params: {
          scope: "profile openid",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      // 初回サインイン時にデータベースにユーザー情報を保存
      if (account?.provider === "line" && profile) {
        try {
          await prisma.user.upsert({
            where: { id: profile.sub as string },
            update: {
              name: profile.name as string,
            },
            create: {
              id: profile.sub as string,
              name: profile.name as string,
            },
          });
          // User saved to database
        } catch (error) {
          console.error("Database error during sign in:", error);
          // データベースエラーでもサインインは続行
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // 初回サインイン時にユーザー情報を保存
      if (account && profile) {
        token.lineUserId = profile.sub as string;
        token.lineUserName = profile.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにLINEユーザー情報を追加
      return {
        ...session,
        user: {
          ...session.user,
          lineUserId: token.lineUserId,
          lineUserName: token.lineUserName,
        },
      };
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
