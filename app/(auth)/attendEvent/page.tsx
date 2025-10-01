import { getAttendEvent } from "@/app/actions/event/getAttendEvent";
import EventCard from "@/app/components/EventCard";
import Header from "@/app/components/Header";

export default async function AttendEventPage() {
  const events = await getAttendEvent();

  return (
    <>
      <Header title="参加するイベント" />
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">参加するイベント</h1>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">参加するイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} isCreator={false} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
