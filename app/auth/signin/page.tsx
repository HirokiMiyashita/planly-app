"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function SignInPage() {
  const { isLineBrowser, signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Planlyへようこそ</h1>
        <p className="text-sm text-gray-600">
          LINEログインかゲスト利用を選択してください
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
