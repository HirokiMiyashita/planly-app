import { getAttendEvent } from "@/app/actions/event/getAttendEvent";
import AttendedEventCard from "@/app/components/AttendedEventCard";
import Header from "@/app/components/Header";

export default async function AttendedEventPage() {
  const events = await getAttendEvent(true);

  return (
    <>
      <Header title="参加したイベント" />
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">参加したイベント</h1>

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">参加したイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <AttendedEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
