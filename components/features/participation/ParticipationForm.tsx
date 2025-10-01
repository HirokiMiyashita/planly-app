"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  type ParticipationStatus,
  participationEvent,
} from "@/app/actions/event/participationEvent";
import { Button } from "@/components/ui/button";

// import { useValidationStore } from "@/stores/validationStore"; // 削除されたためコメントアウト

type LocalParticipationStatus = "○" | "△" | "×" | null;

interface Slot {
  id: number;
  day: string;
  start_at: string;
  end_at: string;
}

interface ParticipationFormProps {
  slots: Slot[];
  eventId: string;
}

export default function ParticipationForm({
  slots,
  eventId,
}: ParticipationFormProps) {
  // 各スロットの参加状況を管理
  const [participations, setParticipations] = useState<
    Record<number, LocalParticipationStatus>
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

    try {
      const participationData = Object.entries(participations)
        .filter(([_, status]) => status !== null)
        .map(([slotId, status]) => ({
          slotId: parseInt(slotId, 10),
          status: status as ParticipationStatus,
        }));

      const result = await participationEvent(eventId, participationData);

      if (result.success) {
        toast.success("参加状況を保存しました");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("エラーが発生しました");
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

  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
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
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-2">
              {(["○", "△", "×"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={
                    participations[slot.id] === status ? "default" : "outline"
                  }
                  className={`w-10 h-10 p-0 text-lg font-bold ${
                    participations[slot.id] === status
                      ? getStatusStyle(status)
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => updateParticipation(slot.id, status)}
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
      ))}
      <Button onClick={handleParticipation}>参加</Button>
    </div>
  );
}
