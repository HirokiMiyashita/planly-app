"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { CandidateDate } from "@/types/event";
import TimeSelectInput from "./TimeSelectInput";

interface CandidateDateListProps {
  candidateDates: CandidateDate[];
  onRemoveDate: (id: number) => void;
  onUpdateTime: (
    id: number,
    field: "startTime" | "endTime",
    value: string,
  ) => void;
  disabled?: boolean;
}

export default function CandidateDateList({
  candidateDates,
  onRemoveDate,
  onUpdateTime,
  disabled = false,
}: CandidateDateListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `${dateString} (今日)`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${dateString} (明日)`;
    } else {
      return dateString;
    }
  };

  if (candidateDates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">選択された候補日:</div>
      <div className="space-y-2">
        {candidateDates.map((candidate) => (
          <div
            key={candidate.id || candidate.date}
            className="border rounded-lg p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {formatDate(candidate.date)}
              </span>
              <Button
                type="button"
                className="text-white hover:text-red-700 text-sm bg-red-500"
                onClick={() => onRemoveDate(candidate.id || 0)}
                disabled={disabled}
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 w-[85%]">
                <Label className="text-xs text-gray-500">開始時間</Label>
                <TimeSelectInput
                  idPrefix={`candidate-${candidate.id || 0}-start`}
                  value={candidate.startTime}
                  onChange={(value) =>
                    onUpdateTime(candidate.id || 0, "startTime", value)
                  }
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1 w-[85%]">
                <Label className="text-xs text-gray-500">終了時間</Label>
                <TimeSelectInput
                  idPrefix={`candidate-${candidate.id || 0}-end`}
                  value={candidate.endTime}
                  onChange={(value) =>
                    onUpdateTime(candidate.id || 0, "endTime", value)
                  }
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
