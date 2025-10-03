"use client";

import { Button } from "@/components/ui/button";

interface FriendAddAlertProps {
  onAddFriend: () => void;
}

export default function FriendAddAlert({ onAddFriend }: FriendAddAlertProps) {
  return (
    <div className="flex items-center justify-center bg-gray-100">
      <div className="max-w-md  px-4">
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-lg p-6 space-y-4 text-center">
          <p className="text-yellow-800 text-sm font-medium">
            アカウント連携がされておりません。
            <br />
            連携されないと通知できません
          </p>
          <ul className="text-xs text-gray-500 text-left">
            <li>• イベントの日程確定時に通知できません</li>
            <li>• 参加状況の確認ができません</li>
            <li>• 重要な更新情報の受信ができません</li>
          </ul>
          <Button onClick={onAddFriend} variant="outline" className="w-full ">
            LINE友達追加
          </Button>
        </div>
      </div>
    </div>
  );
}
