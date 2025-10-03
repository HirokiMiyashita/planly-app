"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { markFriendAdded } from "@/app/actions/friendActions";
import FriendAddAlert from "@/components/features/auth/FriendAddAlert";
import OnboardingModal from "@/components/features/auth/OnboardingModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRandomColors } from "@/hooks/useRandomColors";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOpen, closeOnboarding } = useOnboarding();
  const { getColor } = useRandomColors({ count: 8 });
  const { update: updateSession } = useSession();

  const handleCreateEvent = () => {
    router.push("/createEvent");
  };

  const handleMyEvents = () => {
    router.push("/myEvents");
  };

  const handleJoinEvents = () => {
    router.push("/attendEvent");
  };

  const handleJoinedEvents = () => {
    router.push("/attendedEvent");
  };

  const handleAddFriend = async () => {
    try {
      const result = await markFriendAdded();
      if (result.success) {
        await updateSession();
        window.open("https://line.me/R/ti/p/@511pngni", "_blank");
      } else {
        console.error("友達追加状態の更新に失敗しました:", result.error);
      }
    } catch (error) {
      console.error("友達追加状態の更新に失敗しました:", error);
    }
  };
  return (
    <>
      <OnboardingModal isOpen={isOpen} onClose={closeOnboarding} />
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gray-100 pt-10">
        <div className="text-center space-y-2 max-w-md w-full px-4">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="Planly Logo"
              width={120}
              height={120}
              className="w-30 h-30"
            />
          </div>
          <p className="text-gray-600 text-sm">
            イベントの日程調整を簡単に管理できるアプリです
          </p>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <Button
              variant="outline"
              className="h-20 text-lg font-semibold relative overflow-hidden"
              onClick={handleCreateEvent}
            >
              {/* 1番目（奇数）: 左下・右上 */}
              <span
                className={`absolute bottom-0 left-0 w-8 h-8 ${getColor(0)} rounded-tr-full`}
              ></span>
              <span
                className={`absolute top-0 right-0 w-8 h-8 ${getColor(1)} rounded-bl-full`}
              ></span>
              <span className="relative z-10">イベント新規作成</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 text-lg font-semibold relative overflow-hidden"
              onClick={handleMyEvents}
            >
              {/* 2番目（偶数）: 左上・右下 */}
              <span
                className={`absolute top-0 left-0 w-8 h-8 ${getColor(2)} rounded-br-full`}
              ></span>
              <span
                className={`absolute bottom-0 right-0 w-8 h-8 ${getColor(3)} rounded-tl-full`}
              ></span>
              <span className="relative z-10">作成したイベント一覧</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 text-lg font-semibold relative overflow-hidden"
              onClick={handleJoinEvents}
            >
              {/* 3番目（奇数）: 左下・右上 */}
              <span
                className={`absolute bottom-0 left-0 w-8 h-8 ${getColor(4)} rounded-tr-full`}
              ></span>
              <span
                className={`absolute top-0 right-0 w-8 h-8 ${getColor(5)} rounded-bl-full`}
              ></span>
              <span className="relative z-10">参加するイベント一覧</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 text-lg font-semibold relative overflow-hidden"
              onClick={handleJoinedEvents}
            >
              {/* 4番目（偶数）: 左上・右下 */}
              <span
                className={`absolute top-0 left-0 w-8 h-8 ${getColor(6)} rounded-br-full`}
              ></span>
              <span
                className={`absolute bottom-0 right-0 w-8 h-8 ${getColor(7)} rounded-tl-full`}
              ></span>
              <span className="relative z-10">参加したイベント一覧</span>
            </Button>
            {user && user.isFriendAdded === false ? (
              <FriendAddAlert onAddFriend={handleAddFriend} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
