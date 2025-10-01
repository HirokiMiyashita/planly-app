"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  // ランダムな色を生成する関数
  const getRandomColor = () => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
      "bg-emerald-500",
      "bg-violet-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

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
    <div className="min-h-screen flex items-center justify-center pb-20">
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
            <div
              className={`absolute bottom-0 left-0 w-8 h-8 ${getRandomColor()} rounded-tr-full`}
            ></div>
            <div
              className={`absolute top-0 right-0 w-8 h-8 ${getRandomColor()} rounded-bl-full`}
            ></div>
            <span className="relative z-10">イベント新規作成</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 text-lg font-semibold relative overflow-hidden"
            onClick={handleMyEvents}
          >
            {/* 2番目（偶数）: 左上・右下 */}
            <div
              className={`absolute top-0 left-0 w-8 h-8 ${getRandomColor()} rounded-br-full`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 w-8 h-8 ${getRandomColor()} rounded-tl-full`}
            ></div>
            <span className="relative z-10">作成したイベント一覧</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 text-lg font-semibold relative overflow-hidden"
            onClick={handleJoinEvents}
          >
            {/* 3番目（奇数）: 左下・右上 */}
            <div
              className={`absolute bottom-0 left-0 w-8 h-8 ${getRandomColor()} rounded-tr-full`}
            ></div>
            <div
              className={`absolute top-0 right-0 w-8 h-8 ${getRandomColor()} rounded-bl-full`}
            ></div>
            <span className="relative z-10">参加するイベント一覧</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 text-lg font-semibold relative overflow-hidden"
            onClick={handleJoinedEvents}
          >
            {/* 4番目（偶数）: 左上・右下 */}
            <div
              className={`absolute top-0 left-0 w-8 h-8 ${getRandomColor()} rounded-br-full`}
            ></div>
            <div
              className={`absolute bottom-0 right-0 w-8 h-8 ${getRandomColor()} rounded-tl-full`}
            ></div>
            <span className="relative z-10">参加したイベント一覧</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
