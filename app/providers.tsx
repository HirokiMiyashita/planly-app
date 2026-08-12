"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

function SessionRecovery({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isRecovering = useRef(false);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !session.user.requiresReauthentication ||
      isRecovering.current
    ) {
      return;
    }

    isRecovering.current = true;

    void (async () => {
      await signOut({ redirect: false });
      await signIn("line", { callbackUrl: "/" });
    })();
  }, [session, status]);

  if (status === "authenticated" && session.user.requiresReauthentication) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">LINEログインに切り替えています...</p>
      </div>
    );
  }

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionRecovery>{children}</SessionRecovery>
    </SessionProvider>
  );
}
