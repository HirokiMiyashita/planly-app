"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createEvent } from "@/app/actions/event/createEvent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { Textarea } from "@/components/ui/textarea";
import { useRandomColors } from "@/hooks/useRandomColors";
import type { CandidateDate } from "@/types/event";
import CandidateDateList from "./CandidateDateList";
import CandidateDateSelector from "./CandidateDateSelector";

export default function EventForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { getColor } = useRandomColors({ count: 2 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [candidateDates, setCandidateDates] = useState<CandidateDate[]>([]);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const addCandidateDate = (date: string) => {
    if (date && !candidateDates.some((candidate) => candidate.date === date)) {
      setCandidateDates([
        ...candidateDates,
        {
          date: date,
          startTime: "09:00",
          endTime: "10:00",
        },
      ]);
    }
  };

  const removeCandidateDate = (dateToRemove: string) => {
    setCandidateDates(
      candidateDates.filter((candidate) => candidate.date !== dateToRemove),
    );
  };

  const updateCandidateTime = (
    date: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setCandidateDates(
      candidateDates.map((candidate) =>
        candidate.date === date ? { ...candidate, [field]: value } : candidate,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append("eventName", eventName);
      formData.append("description", description);
      formData.append("candidateDates", JSON.stringify(candidateDates));

      const result = await createEvent(formData);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        // フォームをリセット
        setEventName("");
        setDescription("");
        setCandidateDates([]);
        formRef.current?.reset();
        router.push("/myEvents");
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "予期しないエラーが発生しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} message="イベントを作成中..." />
      <main className="p-4 space-y-6 pb-20">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="eventName"
              className="text-sm font-medium border-l-4 border-red-400 pl-2"
            >
              イベント名
            </Label>
            <p className="text-xs text-gray-500">例) お盆のテニスの開催予定</p>
            <Input
              id="eventName"
              name="eventName"
              placeholder="イベント名を入力してください"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium border-l-4 border-red-400 pl-2"
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
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium border-l-4 border-red-400 pl-2">
              開催候補日時
            </Label>

            <div className="space-y-3">
              <CandidateDateSelector
                onAddDate={addCandidateDate}
                disabled={isSubmitting}
              />
              <CandidateDateList
                candidateDates={candidateDates}
                onRemoveDate={removeCandidateDate}
                onUpdateTime={updateCandidateTime}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 mb-6">
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="text-lg font-semibold relative overflow-hidden w-[80%] mx-auto py-4 h-auto"
              disabled={isSubmitting}
              color="primary"
            >
              <span
                className={`absolute bottom-0 left-0 w-8 h-8 ${getColor(0)} rounded-tr-full`}
              ></span>
              <span
                className={`absolute top-0 right-0 w-8 h-8 ${getColor(1)} rounded-bl-full`}
              ></span>
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
