"use client";

import { Label } from "@/components/ui/label";
import type { CandidateDate } from "@/types/event";
import CandidateDateList from "./CandidateDateList";
import CandidateDateSelector from "./CandidateDateSelector";

interface EventFormStep2Props {
  candidateDates: CandidateDate[];
  onAddDate: (date: string) => void;
  onRemoveDate: (id: number) => void;
  onUpdateTime: (
    id: number,
    field: "startTime" | "endTime",
    value: string,
  ) => void;
  disabled?: boolean;
}

export default function EventFormStep2({
  candidateDates,
  onAddDate,
  onRemoveDate,
  onUpdateTime,
  disabled = false,
}: EventFormStep2Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium border-l-4 border-blue-400 pl-2">
            候補日時 <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500">
            複数の候補日時を追加できます。参加者が選択しやすいよう、複数設定することをお勧めします。
          </p>

          <div className="space-y-3">
            <CandidateDateSelector onAddDate={onAddDate} disabled={disabled} />
            <CandidateDateList
              candidateDates={candidateDates}
              onRemoveDate={onRemoveDate}
              onUpdateTime={onUpdateTime}
              disabled={disabled}
            />
          </div>

          {candidateDates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">まだ候補日時が設定されていません</p>
              <p className="text-xs mt-1">
                上記のフォームから候補日時を追加してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
