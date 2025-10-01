"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CandidateDateSelectorProps {
  onAddDate: (date: string) => void;
}

export default function CandidateDateSelector({
  onAddDate,
}: CandidateDateSelectorProps) {
  const [customDate, setCustomDate] = useState("");

  const getToday = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const getNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  };

  const handleAddCustomDate = () => {
    if (customDate) {
      onAddDate(customDate);
      setCustomDate("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500">候補日</div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onAddDate(getToday())}
          title="今日の日付を候補日として追加"
        >
          今日を追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onAddDate(getTomorrow())}
          title="明日の日付を候補日として追加"
        >
          明日を追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onAddDate(getNextWeek())}
          title="来週の日付を候補日として追加"
        >
          来週を追加
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          placeholder="日付を選択"
          className="flex-1"
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleAddCustomDate}
        >
          追加
        </Button>
      </div>
    </div>
  );
}
