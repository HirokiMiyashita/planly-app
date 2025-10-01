"use client";

import { useState } from "react";
import { toast } from "sonner";
import { confirmed } from "@/app/actions/event/confirmed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "../actions/event/getMyEvent";

interface Participation {
  id: number;
  userId: string;
  userName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface EventCardProps {
  event: Event;
  isCreator: boolean;
}

export default function EventCard({ event, isCreator }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  // 参加状況の集計関数
  const getParticipationSummary = (participations: Participation[] | null) => {
    if (!participations) {
      return {
        yes: 0,
        maybe: 0,
        no: 0,
        total: 0,
      };
    }
    const summary = {
      yes: participations.filter((p) => p.status === "○").length,
      maybe: participations.filter((p) => p.status === "△").length,
      no: participations.filter((p) => p.status === "×").length,
      total: participations.length,
    };
    return summary;
  };

  const handleInvite = async () => {
    try {
      const inviteUrl = `${window.location.origin}/participation/${event.id}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success(`招待URLをコピーしました`, {
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error(error);
      toast.error("コピーに失敗しました", {
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleEdit = () => {
    alert(`イベント「${event.title}」の編集機能は準備中です`);
  };

  const handleConfirmSlot = async (slotId: number) => {
    try {
      const result = await confirmed(event.id.toString(), slotId.toString());
      if (result.success) {
        toast.success(result.message, {
          className: "bg-green-500 text-white",
        });
        // ページをリロードして最新の状態を反映
        window.location.reload();
      } else {
        toast.error(result.message, {
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("確定に失敗しました", {
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{event.title}</CardTitle>
          {event.isConfirmed && (
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              ✓ 確定済み
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{event.description || "説明なし"}</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "参加状況を閉じる" : "参加状況を見る"}
          </Button>
          {isCreator && (
            <>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleInvite}
              >
                招待
              </Button>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleEdit}
              >
                編集
              </Button>
            </>
          )}
        </div>

        {/* 詳細表示 */}
        {showDetails && (
          <div className="mt-4 space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">参加状況</h4>
            {event.slots.map((slot) => {
              const summary = getParticipationSummary(slot.participations);
              return (
                <div key={slot.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(slot.day).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {slot.start_at} - {slot.end_at}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        回答数: {summary.total}人
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        <span>○ {summary.yes}人</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        <span>△ {summary.maybe}人</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        <span>× {summary.no}人</span>
                      </div>
                    </div>

                    {/* 確定ボタン */}
                    {isCreator && (
                      <div className="flex items-center gap-2">
                        {event.confirmedSlotId === slot.id ? (
                          <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            ✓ 確定済み
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-purple-500 hover:bg-purple-600 text-white text-xs"
                            onClick={() => handleConfirmSlot(slot.id)}
                            disabled={event.isConfirmed}
                          >
                            この日時で確定
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 参加者リスト */}
                  {slot.participations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">参加者:</p>
                      <div className="flex flex-wrap gap-1">
                        {slot.participations.map((participation) => (
                          <span
                            key={participation.id}
                            className={`text-xs px-2 py-1 rounded ${
                              participation.status === "○"
                                ? "bg-green-100 text-green-800"
                                : participation.status === "△"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {participation.userName || "不明"}{" "}
                            {participation.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
