import { getMyEvent } from "../../actions/event/getMyEvent";
import Header from "../../components/Header";
import EventCard from "@/app/components/EventCard";

export default async function MyEventsPage() {
  const events = await getMyEvent();
  console.log(events[0]);
  return (
    <>
      <Header title="作成したイベント" />
      <div className="px-4 py-6 space-y-4 pb-20">
        {events.map((event: any) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  );
}
