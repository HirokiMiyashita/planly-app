"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createEvent } from "@/app/actions/event/createEvent";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/loading-overlay";
import type { CandidateDate } from "@/types/event";
import EventFormStep1 from "./EventFormStep1";
import EventFormStep2 from "./EventFormStep2";
import EventFormStep3 from "./EventFormStep3";
import StepProgressIndicator from "./StepProgressIndicator";

export default function EventForm() {
  const topRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [candidateDates, setCandidateDates] = useState<CandidateDate[]>([]);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const stepTitles = ["基本情報", "候補日時", "確認・登録"];
  const totalSteps = stepTitles.length;

  const addCandidateDate = (
    date: string,
    startTime?: string,
    endTime?: string,
  ) => {
    if (date) {
      setCandidateDates([
        ...candidateDates,
        {
          id: Date.now() + Math.random(), // 一意のIDを生成
          date: date,
          startTime: startTime || "09:00",
          endTime: endTime || "10:00",
        },
      ]);
    }
  };

  // エラーメッセージが表示された時に一番上までスクロール
  useEffect(() => {
    if (message && message.type === "error" && topRef.current) {
      setTimeout(() => {
        topRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [message]);

  // ステップナビゲーション関数
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return eventName.trim() !== "";
      case 2:
        return candidateDates.length > 0;
      default:
        return true;
    }
  };

  const removeCandidateDate = (idToRemove: number) => {
    setCandidateDates(
      candidateDates.filter((candidate) => candidate.id !== idToRemove),
    );
  };

  const updateCandidateTime = (
    id: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setCandidateDates(
      candidateDates.map((candidate) =>
        candidate.id === id ? { ...candidate, [field]: value } : candidate,
      ),
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // 時間の妥当性チェック
      const invalidTimes = candidateDates.filter((candidate) => {
        const startTime = new Date(`2000-01-01T${candidate.startTime}:00`);
        const endTime = new Date(`2000-01-01T${candidate.endTime}:00`);
        return startTime >= endTime;
      });

      if (invalidTimes.length > 0) {
        setMessage({
          type: "error",
          text: "開始時刻が終了時刻より前になるように設定してください。",
        });
        setIsSubmitting(false);
        return;
      }

      // 重複チェック
      const duplicates = candidateDates.filter((candidate, index) => {
        return candidateDates.some(
          (other, otherIndex) =>
            otherIndex !== index &&
            other.date === candidate.date &&
            other.startTime === candidate.startTime &&
            other.endTime === candidate.endTime,
        );
      });

      if (duplicates.length > 0) {
        setMessage({
          type: "error",
          text: "同じ日付・同じ時間帯の候補が重複しています。重複を削除してから登録してください。",
        });
        setIsSubmitting(false);
        return;
      }

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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventFormStep1
            eventName={eventName}
            description={description}
            onEventNameChange={setEventName}
            onDescriptionChange={setDescription}
            disabled={isSubmitting}
          />
        );
      case 2:
        return (
          <EventFormStep2
            candidateDates={candidateDates}
            onAddDate={addCandidateDate}
            onRemoveDate={removeCandidateDate}
            onUpdateTime={updateCandidateTime}
            disabled={isSubmitting}
          />
        );
      case 3:
        return (
          <EventFormStep3
            eventName={eventName}
            description={description}
            candidateDates={candidateDates}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} message="イベントを作成中..." />
      <main className="p-4 space-y-4 pb-20">
        <div ref={topRef}>
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
        </div>

        {/* 進捗インジケーター */}
        <StepProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitles={stepTitles}
        />

        {/* 現在のステップのコンテンツ */}
        <div className="min-h-[300px]">{renderCurrentStep()}</div>

        {/* ナビゲーションボタン */}
        {currentStep < 3 && (
          <div className="flex justify-between pt-6 border-t mt-8">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1 || isSubmitting}
              className="px-6"
            >
              前へ
            </Button>
            <Button
              onClick={goToNextStep}
              disabled={!canProceedToNext() || isSubmitting}
              className="px-6"
            >
              次へ
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
