"use client";

import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CandidateDate } from "@/types/event";
import CandidateDateList from "./CandidateDateList";
import CandidateDateSelector from "./CandidateDateSelector";

export type GroupEvent = {
  id: string;
  title: string;
  description: string;
  candidateDates: CandidateDate[];
};

export function GroupInfoFields({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="groupTitle"
          className="border-l-4 border-blue-400 pl-2 text-sm font-medium"
        >
          グループ名 <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500">例）夏休みのイベント日程調整</p>
        <Input
          id="groupTitle"
          placeholder="グループ名を入力してください"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="groupDescription"
          className="border-l-4 border-blue-400 pl-2 text-sm font-medium"
        >
          説明文
        </Label>
        <p className="text-xs text-gray-500">
          複数イベントに共通する案内を入力してください
        </p>
        <Textarea
          id="groupDescription"
          placeholder="グループ全体の説明を入力してください"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="min-h-[120px] text-base"
        />
      </div>
    </div>
  );
}

export function GroupEventFields({
  event,
  eventNumber,
  showIntro = true,
  onChange,
}: {
  event: GroupEvent;
  eventNumber: number;
  showIntro?: boolean;
  onChange: (event: GroupEvent) => void;
}) {
  const addCandidateDate = (
    date: string,
    startTime = "09:00",
    endTime = "10:00",
  ) => {
    onChange({
      ...event,
      candidateDates: [
        ...event.candidateDates,
        {
          id: Date.now() + Math.random(),
          date,
          startTime,
          endTime,
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      {showIntro && (
        <div className="rounded-lg bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-700">
            イベント {eventNumber}
          </p>
          <p className="mt-1 text-xs text-blue-600">
            このイベント専用の内容と候補日時を設定します
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor={`group-event-${event.id}-title`}
            className="border-l-4 border-blue-400 pl-2 text-sm font-medium"
          >
            イベント名 <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-gray-500">例）1日目 バーベキュー</p>
          <Input
            id={`group-event-${event.id}-title`}
            placeholder="イベント名を入力してください"
            value={event.title}
            onChange={(e) => onChange({ ...event, title: e.target.value })}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor={`group-event-${event.id}-description`}
            className="border-l-4 border-blue-400 pl-2 text-sm font-medium"
          >
            説明文
          </Label>
          <Textarea
            id={`group-event-${event.id}-description`}
            placeholder="イベントの説明を入力してください"
            value={event.description}
            onChange={(e) =>
              onChange({ ...event, description: e.target.value })
            }
            className="min-h-[100px] text-base"
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-5">
        <Label className="border-l-4 border-blue-400 pl-2 text-sm font-medium">
          候補日時 <span className="text-red-500">*</span>
        </Label>
        <p className="text-xs text-gray-500">
          このイベントの候補日時を1件以上追加してください
        </p>
        <CandidateDateSelector onAddDate={addCandidateDate} />
        <CandidateDateList
          candidateDates={event.candidateDates}
          onRemoveDate={(id) =>
            onChange({
              ...event,
              candidateDates: event.candidateDates.filter(
                (candidate) => candidate.id !== id,
              ),
            })
          }
          onUpdateTime={(id, field, value) =>
            onChange({
              ...event,
              candidateDates: event.candidateDates.map((candidate) =>
                candidate.id === id
                  ? { ...candidate, [field]: value }
                  : candidate,
              ),
            })
          }
        />
        {event.candidateDates.length === 0 && (
          <div className="py-6 text-center text-gray-500">
            <p className="text-sm">まだ候補日時が設定されていません</p>
            <p className="mt-1 text-xs">
              上記のボタンから候補日時を追加してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const update = () => {
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}

const isEventComplete = (event: GroupEvent) =>
  event.title.trim() !== "" &&
  event.candidateDates.length > 0 &&
  event.candidateDates.every((slot) => slot.date);

export function GroupEventsFields({
  events,
  onEventChange,
  onAddEvent,
  onRemoveEvent,
}: {
  events: GroupEvent[];
  onEventChange: (index: number, event: GroupEvent) => void;
  onAddEvent: () => GroupEvent;
  onRemoveEvent: (index: number) => void;
}) {
  const keyboardInset = useKeyboardInset();
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState<{
    index: number;
    event: GroupEvent;
    isNew: boolean;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editing) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editing]);

  const openEditor = (event: GroupEvent, index: number, isNew = false) => {
    setEditing({
      index,
      isNew,
      event: {
        ...event,
        candidateDates: event.candidateDates.map((candidate) => ({
          ...candidate,
        })),
      },
    });
  };

  const closeEditor = () => {
    if (editing?.isNew) {
      onRemoveEvent(editing.index);
    }
    setEditing(null);
  };

  const saveAndClose = () => {
    if (!editing || !isEventComplete(editing.event)) {
      return;
    }
    onEventChange(editing.index, editing.event);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="border-l-4 border-blue-400 pl-2 text-sm font-medium">
          イベント設定 <span className="text-red-500">*</span>
        </h2>
        <p className="mt-2 text-xs text-gray-500">
          イベントごとに内容と候補日時を設定してください
        </p>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <section
            key={event.id}
            className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
          >
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                isEventComplete(event)
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isEventComplete(event) ? (
                <CheckCircle2 className="size-5" />
              ) : (
                index + 1
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {event.title || `イベント ${index + 1}`}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {isEventComplete(event)
                  ? `候補日時 ${event.candidateDates.length}件・入力済み`
                  : "イベント名と候補日時を入力してください"}
              </p>
            </div>
            <div className="flex shrink-0 items-center">
              {events.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveEvent(index)}
                  className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`イベント ${index + 1}を削除`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => openEditor(event, index)}
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                aria-label={`イベント ${index + 1}を編集`}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          </section>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const addedEvent = onAddEvent();
          openEditor(addedEvent, events.length, true);
        }}
        className="h-11 w-full border-dashed border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50"
      >
        <Plus className="size-4" />
        イベントを追加
      </Button>

      {mounted &&
        editing &&
        createPortal(
          <div
            className="fixed inset-x-0 top-0 z-[100] flex justify-center bg-black/40"
            style={{ height: `calc(100dvh - ${keyboardInset}px)` }}
          >
            <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
              <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-xs font-medium text-blue-600">
                    イベント {editing.index + 1}
                  </p>
                  <h3 className="mt-0.5 font-semibold text-gray-900">
                    イベントを編集
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={closeEditor}
                  aria-label="編集画面を閉じる"
                >
                  <X className="size-5" />
                </Button>
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
                onFocusCapture={(event) => {
                  const target = event.target;
                  if (
                    !(target instanceof HTMLInputElement) &&
                    !(target instanceof HTMLTextAreaElement)
                  ) {
                    return;
                  }
                  window.setTimeout(() => {
                    target.scrollIntoView({
                      block: "center",
                      behavior: "smooth",
                    });
                  }, 300);
                }}
              >
                <GroupEventFields
                  event={editing.event}
                  eventNumber={editing.index + 1}
                  showIntro={false}
                  onChange={(event) =>
                    setEditing((current) =>
                      current ? { ...current, event } : current,
                    )
                  }
                />
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 border-t bg-white p-4">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  キャンセル
                </Button>
                <Button
                  type="button"
                  onClick={saveAndClose}
                  disabled={!isEventComplete(editing.event)}
                >
                  保存して閉じる
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function GroupEventReview({
  title,
  description,
  events,
}: {
  title: string;
  description: string;
  events: GroupEvent[];
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-500">グループ</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {description}
          </p>
        )}
      </section>

      <div className="space-y-3">
        {events.map((event, index) => (
          <section
            key={event.id}
            className="rounded-xl border bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-blue-600">
                  イベント {index + 1}
                </p>
                <h3 className="mt-1 font-semibold">{event.title}</h3>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
                候補 {event.candidateDates.length}件
              </span>
            </div>
            {event.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                {event.description}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
