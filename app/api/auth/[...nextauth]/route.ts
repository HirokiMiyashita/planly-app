import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
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
          scope: "profile openid message",
        },
      },
    }),
    CredentialsProvider({
      id: "guest",
      name: "ゲスト",
      credentials: {},
      async authorize() {
        const guestId = `guest_${crypto.randomUUID()}`;
        const guestName = "ゲスト";

        await prisma.user.upsert({
          where: { id: guestId },
          update: {
            name: guestName,
          },
          create: {
            id: guestId,
            name: guestName,
            isFriendAdded: false,
          },
        });

        return {
          id: guestId,
          name: guestName,
          lineUserId: guestId,
          lineUserName: guestName,
          isFriendAdded: false,
        };
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
    async jwt({ token, account, profile, user }) {
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

      if (
        (account?.provider === "guest" ||
          account?.provider === "credentials") &&
        user
      ) {
        const guestUser = user as {
          id?: string;
          name?: string | null;
          lineUserId?: string;
          lineUserName?: string;
        };

        token.lineUserId =
          guestUser.lineUserId ??
          guestUser.id ??
          (typeof token.sub === "string" ? token.sub : "");
        token.lineUserName =
          guestUser.lineUserName ?? guestUser.name ?? "ゲスト";
        token.isFriendAdded = false;
      }

      // 初回コールバック以降でもIDを欠損させない
      token.lineUserId =
        token.lineUserId ?? (typeof token.sub === "string" ? token.sub : "");
      token.lineUserName =
        token.lineUserName ??
        (typeof token.name === "string" ? token.name : undefined) ??
        "ユーザー";

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
          id:
            (token.lineUserId as string | undefined) ??
            (typeof token.sub === "string" ? token.sub : ""),
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
