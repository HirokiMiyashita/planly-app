"use client";

import { CheckCircle, QrCode } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddFriendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("return") || "/";
  const [isFriendAdded, setIsFriendAdded] = useState(false);

  const handleCopyLink = async () => {
    try {
      const friendLink = "https://line.me/R/ti/p/@511pngni";
      await navigator.clipboard.writeText(friendLink);
      toast.success("友達追加リンクをコピーしました！");
    } catch (error) {
      console.error("コピーに失敗しました:", error);
      toast.error("コピーに失敗しました");
    }
  };

  const handleMarkAsAdded = async () => {
    try {
      const response = await fetch("/api/mark-friend-added", {
        method: "POST",
      });

      if (response.ok) {
        setIsFriendAdded(true);
        toast.success("友達追加完了！");
        setTimeout(() => {
          router.push(returnUrl);
        }, 2000);
      } else {
        toast.error("更新に失敗しました");
      }
    } catch (error) {
      console.error("Error marking friend as added:", error);
      toast.error("エラーが発生しました");
    }
  };

  const handleSkip = () => {
    router.push(returnUrl);
  };

  return (
    <div className="p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">LINE友達追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
                <p className="text-sm text-gray-500">QRコード</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                イベント確定通知を受け取るために、LINE友達追加をお願いします
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleCopyLink} className="w-full">
                友達追加リンクをコピー
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  または、LINEアプリでQRコードをスキャンしてください
                </p>
              </div>

              {isFriendAdded ? (
                <div className="text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  <p className="text-green-600 font-medium">友達追加完了！</p>
                  <p className="text-sm text-gray-500">
                    元のページに戻ります...
                  </p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleMarkAsAdded}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    友達追加完了
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="flex-1"
                  >
                    スキップ
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">
                友達追加のメリット
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• イベント確定時に自動通知</li>
                <li>• 参加状況の確認</li>
                <li>• 重要な更新情報の受信</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
