"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { confirmed } from "@/app/actions/event/confirmed";
import { Button } from "@/components/ui/button";
import type { Event, Participation, Slot } from "@/types/event";

interface EventDetailsProps {
  event: Event;
  isCreator: boolean;
}

export default function EventDetails({ event, isCreator }: EventDetailsProps) {
  const router = useRouter();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

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

  const handleConfirmSlot = async (slotId: number) => {
    try {
      const result = await confirmed(event.id.toString(), slotId.toString());
      if (result.success) {
        toast.success(result.message, {
          className: "bg-green-500 text-white",
        });
        // ページをリロードして最新の状態を反映
        router.refresh();
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

  const handleShowComments = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowCommentModal(true);
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedSlot(null);
  };

  return (
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span>○ {summary.yes}人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>△ {summary.maybe}人</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>× {summary.no}人</span>
                  </div>
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
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-500">参加者:</p>
                  {slot.participations.some((p) => p.comment) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                      onClick={() => handleShowComments(slot)}
                    >
                      コメント表示
                    </Button>
                  )}
                </div>
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
                      {participation.userName || "不明"} {participation.status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* コメント表示モーダル */}
      {showCommentModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">コメント一覧</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseCommentModal}
              >
                ✕
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {new Date(selectedSlot.day).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                })}{" "}
                {selectedSlot.start_at} - {selectedSlot.end_at}
              </p>
            </div>

            <div className="space-y-3">
              {selectedSlot.participations
                .filter((p: Participation) => p.comment)
                .map((participation: Participation) => (
                  <div key={participation.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span
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
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {participation.comment}
                    </p>
                  </div>
                ))}

              {selectedSlot.participations.filter(
                (p: Participation) => p.comment,
              ).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  コメントはありません
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
