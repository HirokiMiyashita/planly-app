"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ParticipationStatus,
  participationEvent,
} from "@/app/actions/event/participationEvent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Participation, Slot } from "@/types/event";

type LocalParticipationStatus = "○" | "△" | "×" | null;

interface ParticipationFormProps {
  slots: Slot[];
  eventId: string;
  currentUserParticipation?: Participation[];
}

export default function ParticipationForm({
  slots,
  eventId,
  currentUserParticipation = [],
}: ParticipationFormProps) {
  const router = useRouter();
  const [savingSlotId, setSavingSlotId] = useState<number | null>(null);
  const [selectedCommentSlot, setSelectedCommentSlot] = useState<Slot | null>(
    null,
  );

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

  const clearError = (key: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  const getError = (key: string) => errors[key];

  const saveSingleParticipation = async (
    slotId: number,
    status: LocalParticipationStatus,
    comment: string,
    showSuccessToast = false,
  ) => {
    if (!status) {
      return;
    }

    setSavingSlotId(slotId);
    try {
      const result = await participationEvent(eventId, [
        {
          slotId,
          status: status as ParticipationStatus,
          comment,
        },
      ]);

      if (result.success) {
        if (showSuccessToast) {
          toast.success("参加状況を保存しました");
        }
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
    } finally {
      setSavingSlotId(null);
    }
  };

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
      void saveSingleParticipation(slotId, status, comments[slotId] || "");
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

  // 回答済みかどうかを判定する関数
  const isAlreadyAnswered = (slotId: number) => {
    return (
      participations[slotId] !== null && participations[slotId] !== undefined
    );
  };

  const handleCommentBlur = (slotId: number) => {
    const selectedStatus = participations[slotId];
    if (!selectedStatus) {
      return;
    }
    void saveSingleParticipation(
      slotId,
      selectedStatus,
      comments[slotId] || "",
      true,
    );
  };

  const handleShowComments = (slot: Slot) => {
    setSelectedCommentSlot(slot);
  };

  const handleCloseCommentModal = () => {
    setSelectedCommentSlot(null);
  };

  const statusOptions: Array<{
    value: Exclude<LocalParticipationStatus, null>;
    label: string;
    activeClass: string;
  }> = [
    {
      value: "○",
      label: "参加",
      activeClass: "bg-red-500 text-white border-red-500",
    },
    {
      value: "×",
      label: "不参加",
      activeClass: "bg-gray-500 text-white border-gray-500",
    },
    {
      value: "△",
      label: "未定",
      activeClass: "bg-slate-500 text-white border-slate-500",
    },
  ];

  const statusLabelMap: Record<
    Exclude<LocalParticipationStatus, null>,
    string
  > = {
    "○": "参加",
    "×": "不参加",
    "△": "未定",
  };

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const isAnswered = isAlreadyAnswered(slot.id);
        const eventDate = new Date(slot.day);
        const joinedUsers = slot.participations.filter((p) => p.status === "○");
        const absentUsers = slot.participations.filter((p) => p.status === "×");
        const pendingUsers = slot.participations.filter(
          (p) => p.status === "△",
        );

        return (
          <div
            key={slot.id}
            className={`rounded-2xl overflow-hidden border ${
              isAnswered
                ? "border-red-200 bg-red-50/40"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="p-4 md:p-5 space-y-4">
              <div className="space-y-1">
                <p className="text-3xl font-bold tracking-tight text-gray-900">
                  {eventDate.getMonth() + 1}/{eventDate.getDate()}（
                  {eventDate.toLocaleDateString("ja-JP", {
                    weekday: "short",
                  })}
                  ）
                </p>
                <p className="text-xs text-gray-500">
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
                      disabled={savingSlotId === slot.id}
                      className={`h-10 rounded-full text-sm border ${
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
                <p className="text-xs text-red-500">
                  {getError(`slot_${slot.id}`)}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCommentInput(slot.id)}
                  disabled={savingSlotId === slot.id}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {showCommentInput[slot.id]
                    ? "コメントを閉じる"
                    : "コメントを追加"}
                </Button>
              </div>

              {showCommentInput[slot.id] && (
                <div className="border-t pt-3">
                  <Textarea
                    placeholder="コメントを入力してください（任意）"
                    value={comments[slot.id] || ""}
                    onChange={(e) => updateComment(slot.id, e.target.value)}
                    onBlur={() => handleCommentBlur(slot.id)}
                    disabled={savingSlotId === slot.id}
                    className="min-h-[80px] text-sm bg-white"
                  />
                </div>
              )}
            </div>

            <div className="bg-white border-t p-4 space-y-5">
              {slot.participations.some((p) => p.comment) && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleShowComments(slot)}
                  >
                    コメント表示
                  </Button>
                </div>
              )}
              {[
                { status: "○" as const, users: joinedUsers },
                { status: "×" as const, users: absentUsers },
                { status: "△" as const, users: pendingUsers },
              ].map((group) => (
                <div key={`${slot.id}-${group.status}`} className="space-y-2">
                  <p className="text-xl font-semibold text-gray-900">
                    {statusLabelMap[group.status]} {group.users.length}
                  </p>
                  {group.users.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {group.users.map((participation) => (
                        <div
                          key={participation.id}
                          className="flex flex-col items-center text-center gap-1"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={participation.userPictureUrl || undefined}
                              alt={participation.userName || "ユーザー"}
                            />
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
                    <p className="text-sm text-gray-400">
                      まだ回答はありません
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedCommentSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">コメント一覧</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseCommentModal}
              >
                閉じる
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {new Date(selectedCommentSlot.day).toLocaleDateString("ja-JP", {
                month: "short",
                day: "numeric",
                weekday: "short",
              })}{" "}
              {selectedCommentSlot.start_at} - {selectedCommentSlot.end_at}
            </p>

            <div className="space-y-3">
              {selectedCommentSlot.participations
                .filter((p) => p.comment)
                .map((participation) => (
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

              {selectedCommentSlot.participations.filter((p) => p.comment)
                .length === 0 && (
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
