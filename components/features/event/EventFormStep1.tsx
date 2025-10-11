"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventFormStep1Props {
  eventName: string;
  description: string;
  onEventNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export default function EventFormStep1({
  eventName,
  description,
  onEventNameChange,
  onDescriptionChange,
  disabled = false,
}: EventFormStep1Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="eventName"
            className="text-sm font-medium border-l-4 border-blue-400 pl-2"
          >
            イベント名 <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500">例) お盆のテニスの開催予定</p>
          <Input
            id="eventName"
            name="eventName"
            placeholder="イベント名を入力してください"
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
            required
            disabled={disabled}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="text-sm font-medium border-l-4 border-blue-400 pl-2"
          >
            説明文
          </Label>
          <p className="text-xs text-gray-500">
            例) 門真市のテニスコートで試合形式で開催します
          </p>
          <Textarea
            id="description"
            name="description"
            placeholder="イベントの詳細を入力してください"
            className="min-h-[120px] text-base"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
