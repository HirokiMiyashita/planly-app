import NextAuth, { type NextAuthOptions } from "next-auth";
import LineProvider from "next-auth/providers/line";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development", // 開発時のみデバッグログを有効化
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID as string,
      clientSecret: process.env.LINE_CLIENT_SECRET_ID as string,
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
              isFriendAdded: false, // 新規ユーザーは友達追加未完了
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

        // 友達追加状況を取得
        try {
          const user = await prisma.user.findUnique({
            where: { id: profile.sub as string },
            select: { isFriendAdded: true },
          });
          token.isFriendAdded = user?.isFriendAdded || false;
        } catch (error) {
          console.error("Error fetching friend status:", error);
          token.isFriendAdded = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにLINEユーザー情報を追加
      let isFriendAdded = token.isFriendAdded;

      // 毎回データベースから最新の友達追加状況を取得
      if (token.lineUserId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.lineUserId as string },
            select: { isFriendAdded: true },
          });
          isFriendAdded = user?.isFriendAdded || false;
        } catch (error) {
          console.error("Error fetching friend status in session:", error);
        }
      }

      return {
        ...session,
        user: {
          ...session.user,
          lineUserId: token.lineUserId,
          lineUserName: token.lineUserName,
          isFriendAdded: isFriendAdded,
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
