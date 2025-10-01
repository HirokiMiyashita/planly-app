"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Participation {
  id: number;
  userId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Slot {
  id: number;
  day: Date;
  startAt: string;
  endAt: string;
  participations: Participation[];
}

interface ConfirmedSlot {
  id: number;
  day: Date;
  startAt: string;
  endAt: string;
}

interface Event {
  id: number;
  title: string;
  description: string | null;
  createdAt: Date;
  isConfirmed: boolean;
  confirmedAt: Date | null;
  confirmedSlotId: number | null;
  slots: Slot[];
  confirmedSlot: ConfirmedSlot | null;
}

interface AttendedEventCardProps {
  event: Event;
}

export default function AttendedEventCard({ event }: AttendedEventCardProps) {
  // ユーザーの参加状況を取得
  console.log(event);
  const userParticipation = event.slots
    .flatMap((slot) => slot.participations)
    .find((participation) => participation.userId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "○":
        return "bg-green-100 text-green-800";
      case "△":
        return "bg-yellow-100 text-yellow-800";
      case "×":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "○":
        return "参加";
      case "△":
        return "未定";
      case "×":
        return "不参加";
      default:
        return "未回答";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{event.description || "説明なし"}</p>
        {/* 確定された日時 */}
        {event.confirmedSlot ? (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-green-800 mb-2">
              確定された日時
            </h4>
            <div className="text-green-700">
              <p className="font-medium">
                {new Date(event.confirmedSlot.day).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
              <p className="text-sm">
                {event.confirmedSlot.startAt || "時間未設定"} -{" "}
                {event.confirmedSlot.endAt || "時間未設定"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-yellow-800 text-sm">
              確定された日時の詳細が取得できませんでした
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Event ID: {event.id}, Confirmed Slot ID: {event.confirmedSlotId}
            </p>
          </div>
        )}

        {/* ユーザーの参加状況 */}
        {userParticipation && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">
              あなたの参加状況
            </h4>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(userParticipation.status)}>
                {getStatusText(userParticipation.status)}
              </Badge>
              <span className="text-sm text-gray-600">
                回答日:{" "}
                {new Date(userParticipation.createdAt).toLocaleDateString(
                  "ja-JP",
                )}
              </span>
            </div>
          </div>
        )}

        {/* 確定日時 */}
        {event.confirmedAt && (
          <div className="mt-4 text-xs text-gray-500">
            確定日時:{" "}
            {new Date(event.confirmedAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
