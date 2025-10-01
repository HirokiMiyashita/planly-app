import { Suspense } from "react";
import Header from "@/components/features/auth/Header";
import EventCard from "@/components/features/event/EventCard";
import { getMyEvent } from "../../actions/event/getMyEvent";

function LoadingSkeleton() {
  return (
    <div className="px-4 py-6 space-y-4 pb-20">
      {[...Array(3)].map((_, i) => (
        <div
          key={_.id}
          className="bg-white rounded-lg shadow-sm p-4 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

async function EventList() {
  const events = await getMyEvent();

  if (events.length === 0) {
    return (
      <div className="px-4 py-6 pb-20">
        <div className="text-center text-gray-500">
          <p>作成したイベントがありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4 pb-20">
      {events.map((event) => (
        <EventCard key={event.id} event={event} isCreator={true} />
      ))}
    </div>
  );
}

export default function MyEventsPage() {
  return (
    <>
      <Header title="作成したイベント" />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventList />
      </Suspense>
    </>
  );
}
