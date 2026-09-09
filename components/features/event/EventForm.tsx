"use client";

import { CalendarDays, ChevronRight, Layers3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createEvent, createEventGroup } from "@/app/actions/event/createEvent";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/ui/loading-overlay";
import type { CandidateDate } from "@/types/event";
import EventFormStep1 from "./EventFormStep1";
import EventFormStep2 from "./EventFormStep2";
import EventFormStep3 from "./EventFormStep3";
import {
  type GroupEvent,
  GroupEventReview,
  GroupEventsFields,
  GroupInfoFields,
} from "./GroupEventForm";
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
  const [eventType, setEventType] = useState<"single" | "group" | null>(null);
  const blankGroupEvent = (): GroupEvent => ({
    id: crypto.randomUUID(),
    title: "",
    description: "",
    candidateDates: [],
  });
  const [groupTitle, setGroupTitle] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([
    blankGroupEvent(),
    blankGroupEvent(),
  ]);
  const router = useRouter();

  const stepTitles =
    eventType === "group"
      ? ["種類選択", "グループ情報", "イベント設定", "確認・登録"]
      : ["種類選択", "基本情報", "候補日時", "確認・登録"];
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
    if (currentStep === 1) {
      return eventType !== null;
    }

    if (eventType === "group") {
      if (currentStep === 2) {
        return groupTitle.trim() !== "";
      }

      if (currentStep === 3) {
        return groupEvents.every(
          (event) =>
            event.title.trim() !== "" &&
            event.candidateDates.length > 0 &&
            event.candidateDates.every((slot) => slot.date),
        );
      }

      return true;
    }

    if (currentStep === 2) {
      return eventName.trim() !== "";
    }
    if (currentStep === 3) {
      return candidateDates.length > 0;
    }

    return true;
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
      if (eventType === "group") {
        const hasInvalidTime = groupEvents.some((event) =>
          event.candidateDates.some(
            (candidate) =>
              new Date(`2000-01-01T${candidate.startTime}:00`) >=
              new Date(`2000-01-01T${candidate.endTime}:00`),
          ),
        );

        if (hasInvalidTime) {
          setMessage({
            type: "error",
            text: "開始時刻が終了時刻より前になるように設定してください。",
          });
          return;
        }

        const formData = new FormData();
        formData.append("title", groupTitle);
        formData.append("description", groupDescription);
        formData.append("events", JSON.stringify(groupEvents));
        const result = await createEventGroup(formData);
        setMessage({
          type: result.success ? "success" : "error",
          text: result.message,
        });
        if (result.success) router.push("/myEvents");
        return;
      }

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
    if (currentStep === 1) {
      const choices = [
        {
          type: "single" as const,
          title: "単一イベント",
          description: "1つのイベントの日程を調整する",
          icon: CalendarDays,
        },
        {
          type: "group" as const,
          title: "複数イベント",
          description: "複数のイベントを1つの招待リンクにまとめる",
          icon: Layers3,
        },
      ];

      return (
        <div>
          <div className="w-full space-y-5">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                作成方法を選択
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                作成したいイベントの種類を選んでください
              </p>
            </div>
            <div className="space-y-3">
              {choices.map(({ type, title, description, icon: Icon }) => (
                <Button
                  key={type}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEventType(type);
                    setCurrentStep(2);
                  }}
                  className="h-auto w-full justify-start gap-4 rounded-xl border-gray-200 bg-white p-5 text-left hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 whitespace-normal">
                    <span className="block text-base font-semibold text-gray-900">
                      {title}
                    </span>
                    <span className="mt-1 block text-xs font-normal leading-relaxed text-gray-500">
                      {description}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-gray-400" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (eventType === "group") {
      if (currentStep === 2) {
        return (
          <GroupInfoFields
            title={groupTitle}
            description={groupDescription}
            onTitleChange={setGroupTitle}
            onDescriptionChange={setGroupDescription}
          />
        );
      }

      if (currentStep === 3) {
        return (
          <GroupEventsFields
            events={groupEvents}
            onEventChange={(eventIndex, updatedEvent) =>
              setGroupEvents((all) =>
                all.map((item, index) =>
                  index === eventIndex ? updatedEvent : item,
                ),
              )
            }
            onAddEvent={() => {
              const event = blankGroupEvent();
              setGroupEvents((all) => [...all, event]);
              return event;
            }}
            onRemoveEvent={(eventIndex) =>
              setGroupEvents((all) =>
                all.filter((_, index) => index !== eventIndex),
              )
            }
          />
        );
      }

      if (currentStep === 4) {
        return (
          <GroupEventReview
            title={groupTitle}
            description={groupDescription}
            events={groupEvents}
          />
        );
      }
    }

    switch (currentStep) {
      case 2:
        return (
          <EventFormStep1
            eventName={eventName}
            description={description}
            onEventNameChange={setEventName}
            onDescriptionChange={setDescription}
            disabled={isSubmitting}
          />
        );
      case 3:
        return (
          <EventFormStep2
            candidateDates={candidateDates}
            onAddDate={addCandidateDate}
            onRemoveDate={removeCandidateDate}
            onUpdateTime={updateCandidateTime}
            disabled={isSubmitting}
          />
        );
      case 4:
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
        {currentStep > 1 && currentStep < totalSteps && (
          <div className="mt-8 flex justify-between border-t pt-6">
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
              disabled={isSubmitting || !canProceedToNext()}
              className="px-6"
            >
              {eventType === "group" && currentStep === totalSteps - 1
                ? "確認へ"
                : "次へ"}
            </Button>
          </div>
        )}

        {eventType === "group" && currentStep === totalSteps && (
          <div className="mt-8 flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isSubmitting}
              className="px-6"
            >
              前へ
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6"
            >
              {isSubmitting ? "作成中..." : "まとめて作成"}
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
