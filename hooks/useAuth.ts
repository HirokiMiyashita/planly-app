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

  const handleSignIn = () => signIn("line", { callbackUrl: "/" });
  const handleLocalSignIn = () => signIn("local-guest", { callbackUrl: "/" });
  const handleSignOut = () => signOut();

  return {
    // 状態
    isLineBrowser,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    signIn: handleSignIn,
    localSignIn: handleLocalSignIn,
    isLocalGuestLogin: process.env.NEXT_PUBLIC_LOCAL_GUEST_LOGIN === "true",
    signOut: handleSignOut,
  };
};
