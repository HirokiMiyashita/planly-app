"use client";

import { useRouter } from "next/navigation";
import OnboardingModal from "@/app/components/OnboardingModal";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useRandomColors } from "@/hooks/useRandomColors";

export default function Home() {
  const router = useRouter();
  const { isOpen, closeOnboarding } = useOnboarding();
  const { getColor } = useRandomColors({ count: 8 });

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

  return (
    <>
      <OnboardingModal isOpen={isOpen} onClose={closeOnboarding} />
      <div className="min-h-screen flex items-center justify-center pb-20 bg-gray-100">
        <div className="text-center space-y-8 max-w-md w-full px-4">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">
              ようこそ Planly へ
            </h1>
            <p className="text-gray-600 text-lg">
              イベントの日程調整を簡単に管理できるアプリです
            </p>
          </div>
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
          </div>
        </div>
      </div>
    </>
  );
}
