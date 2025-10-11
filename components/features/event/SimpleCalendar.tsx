"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SimpleCalendarProps {
  onDateSelect: (date: string) => void;
  disabled?: boolean;
}

export default function SimpleCalendar({
  onDateSelect,
  disabled = false,
}: SimpleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 日本時間（JST）に調整（UTC+9時間）
  const now = new Date();
  const today = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // デバッグ用ログ
  console.log("UTC now:", now.toLocaleDateString("ja-JP"));
  console.log("JST today:", today.toLocaleDateString("ja-JP"));
  console.log("JST today getDate():", today.getDate());

  // 月の最初の日と最後の日を取得
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 = 日曜日
  const daysInMonth = lastDay.getDate();

  // カレンダーの日付配列を生成
  const calendarDays = [];

  // 前月の日付（空白部分）
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // 今月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // 日本時間（JST）で日付を取得
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    onDateSelect(jstDate.toISOString().split("T")[0]);
  };

  const isToday = (date: Date) => {
    // 日付のみを比較（時刻を無視）
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPast = (date: Date) => {
    // 日付のみを比較（時刻を無視）
    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    return dateOnly < todayDateOnly;
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          disabled={disabled}
          className="p-2"
        >
          ←
        </Button>
        <h3 className="text-lg font-semibold">
          {year}年 {monthNames[month]}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          disabled={disabled}
          className="p-2"
        >
          →
        </Button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, _index) => {
          if (!date) {
            return <div key={date} className="h-10" />;
          }

          const isTodayDate = isToday(date);
          const isSelectedDate = isSelected(date);
          const isPastDate = isPast(date);

          return (
            <button
              type="button"
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={disabled || isPastDate}
              className={`
                h-10 text-sm rounded-md transition-colors
                ${
                  isPastDate
                    ? "text-gray-300 cursor-not-allowed"
                    : isSelectedDate
                      ? "bg-blue-600 text-white"
                      : isTodayDate
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* 選択された日付の表示 */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            選択された日付:{" "}
            {selectedDate.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
