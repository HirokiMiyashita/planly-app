"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ParticipationStatus,
  participationEvent,
} from "@/app/actions/event/participationEvent";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  const statusOptions: Array<{
    value: Exclude<LocalParticipationStatus, null>;
    label: string;
    activeClass: string;
  }> = [
    { value: "○", label: "参加", activeClass: "bg-red-500 text-white border-red-500" },
    { value: "×", label: "不参加", activeClass: "bg-gray-500 text-white border-gray-500" },
    { value: "△", label: "未定", activeClass: "bg-slate-500 text-white border-slate-500" },
  ];

  const statusLabelMap: Record<Exclude<LocalParticipationStatus, null>, string> = {
    "○": "参加",
    "×": "不参加",
    "△": "未定",
  };

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
          const eventDate = new Date(slot.day);
          const joinedUsers = slot.participations.filter((p) => p.status === "○");
          const absentUsers = slot.participations.filter((p) => p.status === "×");
          const pendingUsers = slot.participations.filter((p) => p.status === "△");

          return (
            <div
              key={slot.id}
              className={`rounded-2xl overflow-hidden border ${
                isAnswered ? "border-red-200 bg-red-50/40" : "border-gray-200 bg-white"
              }`}
            >
              <div className="p-4 md:p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-4xl font-bold tracking-tight text-gray-900">
                    {eventDate.getMonth() + 1}/{eventDate.getDate()}（
                    {eventDate.toLocaleDateString("ja-JP", { weekday: "short" })}
                    ）
                  </p>
                  <p className="text-sm text-gray-500">
                    {slot.start_at} - {slot.end_at}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((option) => {
                    const isActive = participations[slot.id] === option.value;
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant="outline"
                        onClick={() => updateParticipation(slot.id, option.value)}
                        disabled={isSubmitting}
                        className={`h-11 rounded-full text-base border ${
                          isActive
                            ? option.activeClass
                            : "bg-gray-100 text-gray-600 border-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {isActive ? "✓ " : ""}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>

                {getError(`slot_${slot.id}`) && (
                  <p className="text-xs text-red-500">{getError(`slot_${slot.id}`)}</p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCommentInput(slot.id)}
                    disabled={isSubmitting}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showCommentInput[slot.id] ? "コメントを閉じる" : "コメントを追加"}
                  </Button>
                </div>

                {showCommentInput[slot.id] && (
                  <div className="border-t pt-3">
                    <Textarea
                      placeholder="コメントを入力してください（任意）"
                      value={comments[slot.id] || ""}
                      onChange={(e) => updateComment(slot.id, e.target.value)}
                      disabled={isSubmitting}
                      className="min-h-[80px] text-sm bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="bg-white border-t p-4 space-y-5">
                {[
                  { status: "○" as const, users: joinedUsers },
                  { status: "×" as const, users: absentUsers },
                  { status: "△" as const, users: pendingUsers },
                ].map((group) => (
                  <div key={`${slot.id}-${group.status}`} className="space-y-2">
                    <p className="text-2xl font-semibold text-gray-900">
                      {statusLabelMap[group.status]} {group.users.length}
                    </p>
                    {group.users.length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                        {group.users.map((participation) => (
                          <div
                            key={participation.id}
                            className="flex flex-col items-center text-center gap-1"
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {(participation.userName || "?").slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-700 line-clamp-2">
                              {participation.userName || "不明"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">まだ回答はありません</p>
                    )}
                  </div>
                ))}
              </div>
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
