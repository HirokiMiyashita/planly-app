"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Header from "@/app/components/Header";
import BottomBar from "@/app/components/BottomBar";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user, isLoading, signIn, isLineBrowser } = useAuth();

  // ローディング中の表示
  if (isLoading) {
    return (
      <>
        <Header title="Planly" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isLineBrowser ? "LINEでログイン中..." : "認証情報を確認中..."}
            </p>
          </div>
        </div>
      </>
    );
  }

  // 未ログイン時の表示
  if (!user) {
    return (
      <>
        <Header title="Planly" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md w-full px-4">
            <h2 className="text-xl font-bold text-gray-800">
              Planlyへようこそ
            </h2>
            <p className="text-gray-600">
              LINEアカウントでログインして、イベントの管理を始めましょう
            </p>
            <Button onClick={signIn} className="w-full">
              LINEでログイン
            </Button>
          </div>
        </div>
      </>
    );
  }

  // 認証済みの場合、子コンポーネントを表示
  return (
    <>
      {children}
      <BottomBar />
    </>
  );
}
