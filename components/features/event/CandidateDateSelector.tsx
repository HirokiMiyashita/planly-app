"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SimpleCalendar from "./SimpleCalendar";
import TimeSelector from "./TimeSelector";

interface CandidateDateSelectorProps {
  onAddDate: (date: string, startTime?: string, endTime?: string) => void;
  disabled?: boolean;
}

export default function CandidateDateSelector({
  onAddDate,
  disabled = false,
}: CandidateDateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  const getToday = () => {
    // 日本時間（JST）に調整
    const now = new Date();
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toISOString().split("T")[0];
  };

  const getTomorrow = () => {
    // 日本時間（JST）に調整
    const now = new Date();
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    jstDate.setDate(jstDate.getDate() + 1);
    return jstDate.toISOString().split("T")[0];
  };

  const getNextWeek = () => {
    // 日本時間（JST）に調整
    const now = new Date();
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    jstDate.setDate(jstDate.getDate() + 7);
    return jstDate.toISOString().split("T")[0];
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowTimeSelector(true);
    setShowCalendar(false);
  };

  const handleTimeConfirm = (startTime: string, endTime: string) => {
    if (selectedDate) {
      onAddDate(selectedDate, startTime, endTime);
    }
    setShowTimeSelector(false);
    setSelectedDate(null);
  };

  const handleTimeCancel = () => {
    setShowTimeSelector(false);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">候補日</div>

      {/* クイック選択ボタン */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setSelectedDate(getToday());
            setShowTimeSelector(true);
          }}
          title="今日の日付を候補日として追加"
          disabled={disabled}
        >
          今日を追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setSelectedDate(getTomorrow());
            setShowTimeSelector(true);
          }}
          title="明日の日付を候補日として追加"
          disabled={disabled}
        >
          明日を追加
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => {
            setSelectedDate(getNextWeek());
            setShowTimeSelector(true);
          }}
          title="来週の日付を候補日として追加"
          disabled={disabled}
        >
          来週を追加
        </Button>
      </div>

      {/* カレンダー選択 */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowCalendar(!showCalendar)}
          disabled={disabled}
        >
          {showCalendar ? "カレンダーを閉じる" : "カレンダーから選択"}
        </Button>

        {showCalendar && (
          <SimpleCalendar onDateSelect={handleDateSelect} disabled={disabled} />
        )}
      </div>

      {/* 時間選択モーダル */}
      {showTimeSelector && selectedDate && (
        <TimeSelector
          date={selectedDate}
          onConfirm={handleTimeConfirm}
          onCancel={handleTimeCancel}
          disabled={disabled}
        />
      )}
    </div>
  );
}
