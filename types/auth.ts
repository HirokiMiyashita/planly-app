// 認証関連の型定義

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      lineUserId: string;
      lineUserName: string;
      isFriendAdded: boolean;
      image: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    lineUserId: string;
    lineUserName: string;
    isFriendAdded: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    lineUserId: string;
    lineUserName: string;
    isFriendAdded: boolean;
  }
}
