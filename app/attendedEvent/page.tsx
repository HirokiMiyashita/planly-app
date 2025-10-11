import { Suspense } from "react";
import { getPastEvents } from "@/app/actions/event/getPastEvents";
import Auth from "@/components/features/auth/Auth";
import Header from "@/components/features/auth/Header";
import EventCard from "@/components/features/event/EventCard";

function LoadingSkeleton() {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">参加したイベント</h1>
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

async function EventList() {
  const events = await getPastEvents();

  if (events.length === 0) {
    return (
      <div className="p-4 pb-20">
        <div className="text-center py-8">
          <p className="text-gray-500">参加したイベントはありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      <div className="space-y-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} isCreator={false} />
        ))}
      </div>
    </div>
  );
}

export default function AttendedEventPage() {
  return (
    <Auth>
      <Header title="参加したイベント" />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList />
      </Suspense>
    </Auth>
  );
}
