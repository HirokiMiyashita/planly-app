"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const { user, isLoading, signIn, isLineBrowser } = useAuth();

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLineBrowser ? "LINEでログイン中..." : "認証情報を確認中..."}
          </p>
        </div>
      </div>
    );
  }

  // 未ログイン時の表示
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md w-full px-4">
          <h2 className="text-xl font-bold text-gray-800">Planlyへようこそ</h2>
          <p className="text-gray-600">
            ログイン方法を選んで、イベントの管理を始めましょう
          </p>
          <Button onClick={() => signIn("line")} className="w-full">
            LINEでログイン
          </Button>
          <Button
            variant="outline"
            onClick={() => signIn("guest")}
            className="w-full"
          >
            ゲストとして利用
          </Button>
          {!isLineBrowser && (
            <p className="text-xs text-gray-500">
              ゲスト利用では一部LINE連携機能を利用できません
            </p>
          )}
        </div>
      </div>
    );
  }

  // 認証済みの場合、子コンポーネントを表示
  return <>{children}</>;
}
