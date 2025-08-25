import NextAuth from "next-auth";
import LineProvider from "next-auth/providers/line";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const handler = NextAuth({
  debug: true, // デバッグログを有効化
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
    async signIn({ user, account, profile }) {
      // 初回サインイン時にデータベースにユーザー情報を保存
      if (account?.provider === 'line' && profile) {
        try {
          await sql`
            INSERT INTO users (id, name, created_at)
            VALUES (${profile.sub}, ${profile.name}, NOW())
            ON CONFLICT (id) DO NOTHING
          `;
          console.log('User saved to database:', profile.sub);
        } catch (error) {
          console.error('Database error during sign in:', error);
          // データベースエラーでもサインインは続行
        }
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // 初回サインイン時にユーザー情報を保存
      if (account && profile) {
        token.lineUserId = profile.sub;
        token.lineUserName = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      // セッションにLINEユーザー情報を追加
      if (token.lineUserId) {
        session.user.lineUserId = token.lineUserId as string;
        session.user.lineUserName = token.lineUserName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST };
