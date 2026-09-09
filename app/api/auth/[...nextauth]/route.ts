import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import LineProvider from "next-auth/providers/line";
import { prisma } from "@/lib/prisma";

const localGuestEnabled = process.env.LOCAL_GUEST_LOGIN === "true";
const localGuestId = "local_dev_user";

const getProfilePictureUrl = (profile: unknown): string | null => {
  if (!profile || typeof profile !== "object") {
    return null;
  }
  const profileWithPicture = profile as { picture?: string };
  return profileWithPicture.picture ?? null;
};

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
    ...(localGuestEnabled
      ? [
          CredentialsProvider({
            id: "local-guest",
            name: "ローカルゲスト",
            credentials: {},
            async authorize() {
              return {
                id: localGuestId,
                name: "ローカルユーザー",
                lineUserId: localGuestId,
                lineUserName: "ローカルユーザー",
                isFriendAdded: false,
              };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ account, profile, user }) {
      // 初回サインイン時にデータベースにユーザー情報を保存
      if (account?.provider === "line" && profile) {
        const pictureUrl = getProfilePictureUrl(profile);
        try {
          await prisma.user.upsert({
            where: { id: profile.sub as string },
            update: {
              name: profile.name as string,
              pictureUrl,
            },
            create: {
              id: profile.sub as string,
              name: profile.name as string,
              pictureUrl,
              isFriendAdded: false, // 新規ユーザーは友達追加未完了
            },
          });
          // User saved to database
        } catch (error) {
          console.error("Database error during sign in:", error);
          return false;
        }
      }
      if (account?.provider === "local-guest" && user) {
        await prisma.user.upsert({
          where: { id: localGuestId },
          update: { name: "ローカルユーザー" },
          create: {
            id: localGuestId,
            name: "ローカルユーザー",
            isFriendAdded: false,
          },
        });
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
      if (account?.provider === "local-guest" && user) {
        token.lineUserId = localGuestId;
        token.lineUserName = "ローカルユーザー";
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
      let userExists: boolean | null = null;
      const lineUserId =
        typeof token.lineUserId === "string" ? token.lineUserId : "";

      // 毎回データベースから最新の友達追加状況を取得
      if (lineUserId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: lineUserId },
            select: { isFriendAdded: true },
          });
          userExists = user !== null;
          isFriendAdded = user?.isFriendAdded || false;
        } catch (error) {
          console.error("Error fetching friend status in session:", error);
        }
      }

      const requiresReauthentication =
        !lineUserId || lineUserId.startsWith("guest_") || userExists === false;

      return {
        ...session,
        user: {
          ...session.user,
          id: lineUserId,
          lineUserId,
          lineUserName: token.lineUserName,
          isFriendAdded: isFriendAdded,
          requiresReauthentication,
        },
      };
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
