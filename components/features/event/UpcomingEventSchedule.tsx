"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Event, Slot } from "@/types/event";

type ViewMode = "calendar" | "upcoming";

interface UpcomingEventScheduleProps {
  events: Event[];
}

interface ScheduleItem {
  eventId: number;
  title: string;
  day: string;
  startAt: string;
  endAt: string;
  participantNames: string[];
}

const WEEK_NAMES = ["日", "月", "火", "水", "木", "金", "土"] as const;
const MONTH_NAMES = [
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
] as const;

const pad2 = (value: number) => value.toString().padStart(2, "0");

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const fromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatMonthLabel = (date: Date) =>
  `${date.getFullYear()}年${MONTH_NAMES[date.getMonth()]}`;

const getUpcomingSlots = (event: Event, todayKey: string): Slot[] => {
  if (event.isConfirmed && event.confirmedSlotId) {
    const confirmedSlot = event.slots.find((slot) => slot.id === event.confirmedSlotId);
    if (confirmedSlot && confirmedSlot.day >= todayKey) {
      return [confirmedSlot];
    }
    return [];
  }

  return event.slots
    .filter((slot) => slot.day >= todayKey)
    .sort((a, b) =>
      `${a.day} ${a.start_at}`.localeCompare(`${b.day} ${b.start_at}`, "ja"),
    );
};

const getWeekday = (dateKey: string) => WEEK_NAMES[fromDateKey(dateKey).getDay()];

export default function UpcomingEventSchedule({
  events,
}: UpcomingEventScheduleProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey(new Date()));

  const scheduleItems = useMemo(() => {
    const todayKey = toDateKey(new Date());
    return events
      .flatMap((event) => {
        const upcomingSlots = getUpcomingSlots(event, todayKey);
        return upcomingSlots.map((slot): ScheduleItem => {
          const participantNames = slot.participations
            .filter((participation) => participation.status === "○")
            .map((participation) => participation.userName || "ユーザー")
            .slice(0, 12);

          return {
            eventId: event.id,
            title: event.title,
            day: slot.day,
            startAt: slot.start_at,
            endAt: slot.end_at,
            participantNames,
          };
        });
      })
      .sort((a, b) =>
        `${a.day} ${a.startAt}`.localeCompare(`${b.day} ${b.startAt}`, "ja"),
      );
  }, [events]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of scheduleItems) {
      const list = map.get(item.day) ?? [];
      list.push(item);
      map.set(item.day, list);
    }
    return map;
  }, [scheduleItems]);

  const monthlyItems = useMemo(() => {
    return scheduleItems.filter((item) => {
      const date = fromDateKey(item.day);
      return (
        date.getFullYear() === currentMonth.getFullYear() &&
        date.getMonth() === currentMonth.getMonth()
      );
    });
  }, [currentMonth, scheduleItems]);

  const selectedItems = useMemo(() => {
    return itemsByDay.get(selectedDateKey) ?? [];
  }, [itemsByDay, selectedDateKey]);

  const upcomingByMonth = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of scheduleItems) {
      const date = fromDateKey(item.day);
      const monthKey = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
      const list = map.get(monthKey) ?? [];
      list.push(item);
      map.set(monthKey, list);
    }
    return [...map.entries()];
  }, [scheduleItems]);

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const leadBlankCount = firstDayOfMonth.getDay();
  const trailingBlankCount = (7 - ((leadBlankCount + daysInMonth) % 7)) % 7;
  const totalCells = leadBlankCount + daysInMonth + trailingBlankCount;

  const calendarCells = Array.from({ length: totalCells }, (_, index) => {
    const day = index - leadBlankCount + 1;
    if (day <= 0 || day > daysInMonth) {
      return {
        key: `blank-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`,
        date: null,
        dateKey: null,
      };
    }
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    return {
      key: `day-${toDateKey(date)}`,
      date,
      dateKey: toDateKey(date),
    };
  });

  const moveMonth = (offset: number) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1),
    );
  };

  const openEvent = (eventId: number) => {
    router.push(`/event/${eventId}`);
  };

  if (scheduleItems.length === 0) {
    return (
      <div className="bg-white min-h-[70vh] p-6 text-center text-gray-500">
        参加予定のイベントはありません
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-[70vh]">
      <section className="bg-red-500 text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">イベント</h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "text-white hover:bg-white/20",
                viewMode === "calendar" && "bg-white/20",
              )}
              onClick={() => setViewMode("calendar")}
            >
              カレンダー
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={cn(
                "text-white hover:bg-white/20",
                viewMode === "upcoming" && "bg-white/20",
              )}
              onClick={() => setViewMode("upcoming")}
            >
              今後
            </Button>
          </div>
        </div>

        {viewMode === "calendar" && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveMonth(-1)}
                className="text-white hover:bg-white/20"
              >
                ←
              </Button>
              <p className="text-3xl font-bold">{formatMonthLabel(currentMonth)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveMonth(1)}
                className="text-white hover:bg-white/20"
              >
                →
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-7 text-center text-sm text-red-100">
              {WEEK_NAMES.map((dayName) => (
                <p key={dayName} className="py-1">
                  {dayName}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1 text-center mt-1">
              {calendarCells.map((cell) => {
                if (!cell.date || !cell.dateKey) {
                  return <div key={cell.key} className="h-10" />;
                }

                const hasEvents = (itemsByDay.get(cell.dateKey)?.length ?? 0) > 0;
                const isSelected = selectedDateKey === cell.dateKey;

                return (
                  <button
                    type="button"
                    key={cell.key}
                    onClick={() => setSelectedDateKey(cell.dateKey)}
                    className={cn(
                      "h-10 mx-1 rounded-full text-base relative",
                      isSelected
                        ? "bg-red-700 text-white"
                        : "text-white hover:bg-white/20",
                    )}
                  >
                    {cell.date.getDate()}
                    {hasEvents && (
                      <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white min-h-[45vh]">
        {viewMode === "calendar" ? (
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm text-gray-500">
              {fromDateKey(selectedDateKey).toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            {(selectedItems.length > 0 ? selectedItems : monthlyItems).map((item) => (
              <button
                type="button"
                key={`${item.eventId}-${item.day}`}
                onClick={() => openEvent(item.eventId)}
                className="w-full rounded-xl border p-4 text-left hover:bg-gray-50"
              >
                <p className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {item.startAt} - {item.endAt}
                </p>
              </button>
            ))}
            {selectedItems.length === 0 && monthlyItems.length === 0 && (
              <p className="text-sm text-gray-500 py-4">
                この月の参加予定はありません
              </p>
            )}
          </div>
        ) : (
          <div className="py-2">
            {upcomingByMonth.map(([monthKey, items]) => {
              const [year, month] = monthKey.split("-").map(Number);
              return (
                <div key={monthKey}>
                  <div className="px-4 pt-4 pb-2">
                    <p className="text-sm text-gray-500">{year}</p>
                    <p className="text-5xl font-bold text-black">{month}月</p>
                  </div>
                  {items.map((item) => {
                    const date = fromDateKey(item.day);
                    const overflowCount = Math.max(item.participantNames.length - 5, 0);
                    return (
                      <button
                        type="button"
                        key={`${item.eventId}-${item.day}`}
                        onClick={() => openEvent(item.eventId)}
                        className="w-full px-4 py-4 border-t text-left hover:bg-gray-50"
                      >
                        <div className="flex gap-4">
                          <div className="w-14 shrink-0 text-center">
                            <p className="text-5xl leading-none font-light">
                              {pad2(date.getDate())}
                            </p>
                            <p className="mt-1 text-lg text-gray-500">
                              {getWeekday(item.day)}
                            </p>
                          </div>
                          <div className="flex-1">
                            <p className="text-3xl font-semibold text-gray-900 leading-tight">
                              {item.title}
                            </p>
                            <p className="mt-2 text-xl text-gray-500">
                              {item.startAt} - {item.endAt}
                            </p>
                            {item.participantNames.length > 0 && (
                              <div className="mt-3 flex items-center gap-2">
                                {item.participantNames.slice(0, 5).map((name, index) => (
                                  <Avatar key={`${item.eventId}-${name}-${index}`} className="h-8 w-8">
                                    <AvatarFallback className="text-[10px] bg-gray-200 text-gray-700">
                                      {name.slice(0, 1)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {overflowCount > 0 && (
                                  <span className="text-base text-gray-500">+{overflowCount}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
