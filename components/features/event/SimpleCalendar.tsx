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
  const getJstDateParts = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(new Date());
    const value = (type: "year" | "month" | "day") =>
      Number(parts.find((part) => part.type === type)?.value);
    return {
      year: value("year"),
      month: value("month") - 1,
      day: value("day"),
    };
  };

  const toDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`;

  const [currentDate, setCurrentDate] = useState(() => {
    const today = getJstDateParts();
    return new Date(Date.UTC(today.year, today.month, 1));
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = getJstDateParts();
  const todayKey = toDateKey(today.year, today.month, today.day);
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();

  // 月の最初の日と最後の日を取得
  const firstDayOfWeek = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  // カレンダーの日付配列を生成
  const calendarDays: number[] = [];

  // 前月の日付（空白部分）
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(-(i + 1));
  }

  // 今月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
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
    setCurrentDate(new Date(Date.UTC(year, month - 1, 1)));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(Date.UTC(year, month + 1, 1)));
  };

  const handleDateClick = (day: number) => {
    const dateKey = toDateKey(year, month, day);
    setSelectedDate(dateKey);
    onDateSelect(dateKey);
  };

  const isToday = (day: number) => toDateKey(year, month, day) === todayKey;
  const isSelected = (day: number) =>
    toDateKey(year, month, day) === selectedDate;
  const isPast = (day: number) => toDateKey(year, month, day) < todayKey;

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
        {calendarDays.map((day) => {
          if (day < 0) {
            return (
              <div key={`blank-${year}-${month}-${day}`} className="h-10" />
            );
          }

          const dateKey = toDateKey(year, month, day);
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);
          const isPastDate = isPast(day);

          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => handleDateClick(day)}
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
              {day}
            </button>
          );
        })}
      </div>

      {/* 選択された日付の表示 */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            選択された日付:{" "}
            {new Date(`${selectedDate}T00:00:00+09:00`).toLocaleDateString(
              "ja-JP",
              {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              },
            )}
          </p>
        </div>
      )}
    </div>
  );
}
