"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { getEventGroup } from "@/app/actions/event/getEventGroup";
import ParticipationForm from "./ParticipationForm";

type EventGroupData = NonNullable<Awaited<ReturnType<typeof getEventGroup>>>;

export default function GroupParticipationForm({
  group,
}: {
  group: EventGroupData;
}) {
  const [expandedEventId, setExpandedEventId] = useState<number | undefined>(
    group.events[0]?.id,
  );
  const answeredCount = group.events.filter(
    (event) => event.isUserRegistered,
  ).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">回答状況</span>
          <span className="text-gray-500">
            {answeredCount}/{group.events.length} イベント回答済み
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-red-500 transition-all"
            style={{
              width: `${
                group.events.length === 0
                  ? 0
                  : (answeredCount / group.events.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {group.events.map((event, index) => {
        const isExpanded = expandedEventId === event.id;
        return (
          <section
            key={event.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedEventId(isExpanded ? undefined : event.id)
              }
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  event.isUserRegistered
                    ? "bg-green-100 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {event.isUserRegistered ? (
                  <Check className="size-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-gray-900">
                  {event.title}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  候補日時 {event.slots.length}件
                  {event.isUserRegistered && "・回答済み"}
                </span>
              </span>
              <ChevronDown
                className={`size-5 shrink-0 text-gray-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="border-t bg-gray-50 px-3 py-4">
                {event.description && (
                  <p className="mb-4 whitespace-pre-wrap px-1 text-sm text-gray-600">
                    {event.description}
                  </p>
                )}
                {event.slots.length > 0 ? (
                  <ParticipationForm
                    slots={event.slots}
                    eventId={event.id.toString()}
                    currentUserParticipation={event.currentUserParticipation}
                  />
                ) : (
                  <p className="py-4 text-center text-sm text-gray-500">
                    候補日時が設定されていません
                  </p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
