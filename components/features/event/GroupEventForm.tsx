"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
  const [expandedEventId, setExpandedEventId] = useState<string | undefined>(
    events[0]?.id,
  );

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
        {events.map((event, index) => {
          const isExpanded = expandedEventId === event.id;
          return (
            <section
              key={event.id}
              className="overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedEventId(isExpanded ? undefined : event.id)
                }
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {event.title || `イベント ${index + 1}`}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    候補日時 {event.candidateDates.length}件
                  </span>
                </span>
                <ChevronDown
                  className={`size-4 text-gray-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="space-y-4 border-t p-4">
                  {events.length > 2 && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onRemoveEvent(index);
                          setExpandedEventId(
                            events.find((_, eventIndex) => eventIndex !== index)
                              ?.id,
                          );
                        }}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                        削除
                      </Button>
                    </div>
                  )}
                  <GroupEventFields
                    event={event}
                    eventNumber={index + 1}
                    showIntro={false}
                    onChange={(updatedEvent) =>
                      onEventChange(index, updatedEvent)
                    }
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const addedEvent = onAddEvent();
          setExpandedEventId(addedEvent.id);
        }}
        className="h-11 w-full border-dashed border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50"
      >
        <Plus className="size-4" />
        イベントを追加
      </Button>
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
