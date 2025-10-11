"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimeSelectorProps {
  date: string;
  onConfirm: (startTime: string, endTime: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function TimeSelector({
  date,
  onConfirm,
  onCancel,
  disabled = false,
}: TimeSelectorProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const handleConfirm = () => {
    // 時間の妥当性チェック
    if (startTime >= endTime) {
      alert("開始時刻は終了時刻より前になるように設定してください。");
      return;
    }
    onConfirm(startTime, endTime);
  };

  const presetTimes = [
    { label: "午前 (9:00-12:00)", start: "09:00", end: "12:00" },
    { label: "午後 (13:00-17:00)", start: "13:00", end: "17:00" },
    { label: "夕方 (17:00-20:00)", start: "17:00", end: "20:00" },
    { label: "夜 (19:00-22:00)", start: "19:00", end: "22:00" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">時間を設定</h3>
        
        <div className="space-y-4">
          {/* 選択された日付の表示 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              選択された日付: {formatDate(date)}
            </p>
          </div>

          {/* カスタム時間設定 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime" className="text-xs text-gray-600 mb-2">
                  開始時刻
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-xs text-gray-600 mb-2">
                  終了時刻
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={disabled}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={disabled}
              className="flex-1"
            >
              追加
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
