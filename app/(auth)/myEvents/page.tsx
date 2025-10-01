import EventCard from "@/app/components/EventCard";
import { getMyEvent } from "../../actions/event/getMyEvent";
import Header from "../../components/Header";

export default async function MyEventsPage() {
  const events = await getMyEvent();
  return (
    <>
      <Header title="作成したイベント" />
      <div className="px-4 py-6 space-y-4 pb-20">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </>
  );
}
