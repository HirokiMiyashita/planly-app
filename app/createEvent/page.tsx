import Auth from "@/components/features/auth/Auth";
import Header from "@/components/features/auth/Header";
import EventForm from "@/components/features/event/EventForm";

export default function CreateEvent() {
  return (
    <Auth>
      <Header title="新規イベント作成" />
      <EventForm />
    </Auth>
  );
}
