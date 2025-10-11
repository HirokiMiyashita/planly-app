"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ParticipationStatus,
  participationEvent,
} from "@/app/actions/event/participationEvent";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Textarea } from "@/components/ui/textarea";
import type { Participation, Slot } from "@/types/event";

type LocalParticipationStatus = "○" | "△" | "×" | null;

interface ParticipationFormProps {
  slots: Slot[];
  eventId: string;
  currentUserParticipation?: Participation[];
  isUserRegistered?: boolean;
}

export default function ParticipationForm({
  slots,
  eventId,
  currentUserParticipation = [],
  isUserRegistered = false,
}: ParticipationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 各スロットの参加状況を管理（既存の参加状況を初期値として設定）
  const [participations, setParticipations] = useState<
    Record<number, LocalParticipationStatus>
  >(() => {
    const initialParticipations: Record<number, LocalParticipationStatus> = {};
    currentUserParticipation.forEach((participation) => {
      // スロットIDを取得するために、slotsから該当するスロットを探す
      const slot = slots.find((s) =>
        s.participations.some((p) => p.id === participation.id),
      );
      if (slot) {
        initialParticipations[slot.id] =
          participation.status as LocalParticipationStatus;
      }
    });
    return initialParticipations;
  });

  // 各スロットのコメントを管理
  const [comments, setComments] = useState<Record<number, string>>(() => {
    const initialComments: Record<number, string> = {};
    currentUserParticipation.forEach((participation) => {
      const slot = slots.find((s) =>
        s.participations.some((p) => p.id === participation.id),
      );
      if (slot && participation.comment) {
        initialComments[slot.id] = participation.comment;
      }
    });
    return initialComments;
  });

  // 各スロットのコメント表示状態を管理
  const [showCommentInput, setShowCommentInput] = useState<
    Record<number, boolean>
  >({});

  // バリデーション状態（useValidationStoreの代替）
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = (key: string, message: string) => {
    setErrors((prev) => ({ ...prev, [key]: message }));
  };

  const clearError = (key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const getError = (key: string) => errors[key];

  // 参加状況を更新する関数
  const updateParticipation = (
    slotId: number,
    status: LocalParticipationStatus,
  ) => {
    setParticipations((prev) => ({
      ...prev,
      [slotId]: status,
    }));

    // ステータスが選択されたらエラーをクリア
    if (status !== null) {
      clearError(`slot_${slotId}`);
    }
  };

  // コメントを更新する関数
  const updateComment = (slotId: number, comment: string) => {
    setComments((prev) => ({
      ...prev,
      [slotId]: comment,
    }));
  };

  // コメント入力の表示/非表示を切り替える関数
  const toggleCommentInput = (slotId: number) => {
    setShowCommentInput((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  // バリデーション関数
  const validateParticipations = () => {
    clearAllErrors();
    let hasErrors = false;

    slots.forEach((slot) => {
      if (
        participations[slot.id] === null ||
        participations[slot.id] === undefined
      ) {
        setError(`slot_${slot.id}`, "参加状況を選択してください");
        hasErrors = true;
      }
    });

    return !hasErrors;
  };

  const handleParticipation = async () => {
    // バリデーション実行
    if (!validateParticipations()) {
      toast.error("全ての候補日程で参加状況を選択してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const participationData = Object.entries(participations)
        .filter(([_, status]) => status !== null)
        .map(([slotId, status]) => ({
          slotId: parseInt(slotId, 10),
          status: status as ParticipationStatus,
          comment: comments[parseInt(slotId, 10)] || "",
        }));

      const result = await participationEvent(eventId, participationData);

      if (result.success) {
        toast.success("参加状況を保存しました");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 参加状況のスタイルを取得する関数
  const getStatusStyle = (status: LocalParticipationStatus) => {
    switch (status) {
      case "○":
        return "bg-green-500 text-white hover:bg-green-600";
      case "△":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "×":
        return "bg-red-500 text-white hover:bg-red-600";
      default:
        return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    }
  };

  // 回答済みかどうかを判定する関数
  const isAlreadyAnswered = (slotId: number) => {
    return (
      participations[slotId] !== null && participations[slotId] !== undefined
    );
  };

  // 回答済みのスロット数をカウント
  const answeredSlotsCount = Object.values(participations).filter(
    (status) => status !== null && status !== undefined,
  ).length;

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} message="参加状況を保存中..." />
      <div className="space-y-4">
        {/* 参加登録状況 */}
        <div
          className={`p-3 rounded-lg ${
            isUserRegistered
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {isUserRegistered ? (
              <>
                <span className="text-green-600">✓</span>
                <p className="text-sm text-green-800 font-medium">
                  参加登録済み
                </p>
              </>
            ) : (
              <>
                <span className="text-yellow-600">×</span>
                <p className="text-sm text-yellow-800 font-medium">
                  まだ参加登録していません
                </p>
              </>
            )}
          </div>
        </div>
        {slots.map((slot) => {
          const isAnswered = isAlreadyAnswered(slot.id);
          return (
            <div
              key={slot.id}
              className={`p-4 rounded-lg space-y-3 ${
                isAnswered
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50"
              }`}
            >
              {/* 日時情報と回答状況 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {new Date(slot.day).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "long",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {slot.start_at} - {slot.end_at}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2">
                    {(["○", "△", "×"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={
                          participations[slot.id] === status
                            ? "default"
                            : "outline"
                        }
                        className={`w-10 h-10 p-0 text-lg font-bold ${
                          participations[slot.id] === status
                            ? getStatusStyle(status)
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => updateParticipation(slot.id, status)}
                        disabled={isSubmitting}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                  {getError(`slot_${slot.id}`) && (
                    <p className="text-xs text-red-500">
                      {getError(`slot_${slot.id}`)}
                    </p>
                  )}
                </div>
              </div>

              {/* コメント追加ボタン */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toggleCommentInput(slot.id)}
                  disabled={isSubmitting}
                  className="text-xs"
                >
                  {showCommentInput[slot.id]
                    ? "コメントを閉じる"
                    : "コメントを追加"}
                </Button>
              </div>

              {/* コメント入力エリア */}
              {showCommentInput[slot.id] && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    コメント:
                  </p>
                  <Textarea
                    placeholder="コメントを入力してください（任意）"
                    value={comments[slot.id] || ""}
                    onChange={(e) => updateComment(slot.id, e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-[80px] text-sm"
                  />
                </div>
              )}

              {/* 参加状況表示 */}
              {slot.participations.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    回答状況:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slot.participations.map((participation) => (
                      <div
                        key={participation.id}
                        className="flex flex-col gap-1"
                      >
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Button
          onClick={handleParticipation}
          disabled={isSubmitting}
          className={`w-full ${
            answeredSlotsCount === slots.length
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-green-500 hover:bg-green-600"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSubmitting
            ? "保存中..."
            : answeredSlotsCount === slots.length
              ? "回答を更新"
              : "参加状況を保存"}
        </Button>
      </div>
    </>
  );
}
