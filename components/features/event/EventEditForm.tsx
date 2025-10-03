"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updateEvent } from "@/app/actions/event/updateEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Textarea } from "@/components/ui/textarea";
import type { Event } from "@/types/event";

interface EventEditFormProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventEditForm({
  event,
  onClose,
  onSuccess,
}: EventEditFormProps) {
  const slotsContainerRef = useRef<HTMLDivElement>(null);
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description || "",
  });
  const [editSlots, setEditSlots] = useState(
    event.slots.map((slot) => ({
      id: slot.id,
      day: slot.day.split("T")[0], // YYYY-MM-DD形式に変換
      start_at: slot.start_at,
      end_at: slot.end_at,
    })),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  // 追加ボタンが押された時だけスクロール
  useEffect(() => {
    if (shouldScroll && slotsContainerRef.current) {
      setTimeout(() => {
        slotsContainerRef.current?.scrollTo({
          top: slotsContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
        setShouldScroll(false); // スクロール後はフラグをリセット
      }, 100);
    }
  }, [shouldScroll]);

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      // 重複チェック
      const duplicates = editSlots.filter((slot, index) => {
        return editSlots.some(
          (other, otherIndex) =>
            otherIndex !== index &&
            other.day === slot.day &&
            other.start_at === slot.start_at &&
            other.end_at === slot.end_at,
        );
      });

      if (duplicates.length > 0) {
        toast.error(
          "同じ日付・同じ時間帯のスロットが重複しています。重複を削除してから保存してください。",
          {
            className: "bg-red-500 text-white",
          },
        );
        setIsLoading(false);
        return;
      }

      // 新規スロットのIDを0に設定（データベースで自動生成される）
      const processedSlots = editSlots.map((slot) => ({
        ...slot,
        id: slot.id > 1000000 ? 0 : slot.id, // 大きな数値の場合は0に設定
      }));

      const result = await updateEvent(event.id.toString(), {
        title: editData.title,
        description: editData.description,
        slots: processedSlots,
      });

      if (result.success) {
        toast.success(result.message, {
          className: "bg-green-500 text-white",
        });
        onSuccess();
      } else {
        toast.error(result.message, {
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("更新に失敗しました", {
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSlot = () => {
    setEditSlots([
      ...editSlots,
      {
        id: Date.now() + Math.random(), // 一意のIDを生成
        day: new Date().toISOString().split("T")[0],
        start_at: "09:00",
        end_at: "18:00",
      },
    ]);
    setShouldScroll(true); // スクロールフラグを設定
  };

  const removeSlot = (index: number) => {
    setEditSlots(editSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...editSlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setEditSlots(newSlots);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message="イベントを更新中..." />
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-sm text-gray-700 mb-3">
          イベント編集
        </h4>

        <div className="space-y-3">
          <div>
            <Label
              className="block text-xs font-medium text-gray-700 mb-1"
              htmlFor="title"
            >
              イベント名
            </Label>
            <Input
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
              placeholder="イベント名を入力"
              className="text-sm bg-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label
              className="block text-xs font-medium text-gray-700 mb-1"
              htmlFor="description"
            >
              説明
            </Label>
            <Textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              placeholder="イベントの説明を入力"
              className="text-sm min-h-[60px] bg-white"
              disabled={isLoading}
            />
          </div>

          {/* スロット編集 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label
                className="block text-xs font-medium text-gray-700"
                htmlFor="slots"
              >
                日時スロット
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addSlot}
                className="text-xs"
                disabled={isLoading}
              >
                + 追加
              </Button>
            </div>

            <div
              className="space-y-3 max-h-48 overflow-y-auto"
              ref={slotsContainerRef}
            >
              {editSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className="bg-white rounded border p-3 w-full"
                >
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {/* 日付 */}
                    <div>
                      <Label
                        className="block text-xs font-medium text-gray-600 mb-1"
                        htmlFor="day"
                      >
                        日付
                      </Label>
                      <Input
                        type="date"
                        value={slot.day}
                        onChange={(e) =>
                          updateSlot(index, "day", e.target.value)
                        }
                        className="text-xs bg-white w-full"
                        disabled={isLoading}
                      />
                    </div>

                    {/* 時間 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label
                          className="block text-xs font-medium text-gray-600 mb-1"
                          htmlFor="start_at"
                        >
                          開始時間
                        </Label>
                        <Input
                          type="time"
                          value={slot.start_at}
                          onChange={(e) =>
                            updateSlot(index, "start_at", e.target.value)
                          }
                          className="text-xs w-full"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <Label
                          className="block text-xs font-medium text-gray-600 mb-1"
                          htmlFor="end_at"
                        >
                          終了時間
                        </Label>
                        <Input
                          type="time"
                          value={slot.end_at}
                          onChange={(e) =>
                            updateSlot(index, "end_at", e.target.value)
                          }
                          className="text-xs w-full"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* 削除ボタン */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeSlot(index)}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        削除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleSaveEdit}
            disabled={isLoading}
          >
            保存
          </Button>
        </div>
      </div>
    </>
  );
}
