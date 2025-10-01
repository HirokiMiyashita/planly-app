"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const [isLineBrowser, setIsLineBrowser] = useState(false);

  // LINE内ブラウザかどうかを判定
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isLine = userAgent.includes("line");
    setIsLineBrowser(isLine);
  }, []);

  // 自動ログイン（LINE内ブラウザのみ）
  useEffect(() => {
    if (status === "unauthenticated" && isLineBrowser) {
      // LINE内ブラウザの場合は即座にログイン
      signIn("line");
    }
  }, [isLineBrowser, status]);

  const handleSignIn = () => signIn("line");
  const handleSignOut = () => signOut();

  return {
    // 状態
    isLineBrowser,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
};
