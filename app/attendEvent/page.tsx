import { Suspense } from "react";
import { getUpcomingEvents } from "@/app/actions/event/getUpcomingEvents";
import Auth from "@/components/features/auth/Auth";
import UpcomingEventSchedule from "@/components/features/event/UpcomingEventSchedule";

function LoadingSkeleton() {
  return (
    <div className="bg-gray-100 min-h-[70vh]">
      <div className="bg-red-500 p-4 pb-6 animate-pulse">
        <div className="h-7 w-24 rounded bg-red-400 mb-4" />
        <div className="h-8 w-36 rounded bg-red-400 mb-3" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 14 }, (_, order) => order + 1).map((order) => (
            <div
              key={`calendar-skeleton-${order}`}
              className="h-8 rounded bg-red-400"
            />
          ))}
        </div>
      </div>
      <div className="bg-white p-4 space-y-3">
        <div className="h-12 rounded bg-gray-100" />
        <div className="h-12 rounded bg-gray-100" />
        <div className="h-12 rounded bg-gray-100" />
      </div>
    </div>
  );
}

async function EventList() {
  const events = await getUpcomingEvents();

  if (events.length === 0) {
    return (
      <div className="bg-white p-4 pb-20">
        <div className="text-center py-10">
          <p className="text-gray-500">参加するイベントはありません</p>
        </div>
      </div>
    );
  }

  return <UpcomingEventSchedule events={events} />;
}

export default function AttendEventPage() {
  return (
    <Auth>
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList />
      </Suspense>
    </Auth>
  );
}
