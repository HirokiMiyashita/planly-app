import { notFound } from "next/navigation";
import { getOwnedEventGroup } from "@/app/actions/event/getEventGroup";
import Auth from "@/components/features/auth/Auth";
import Header from "@/components/features/auth/Header";
import EventGroupDetailPage from "@/components/features/event/EventGroupDetailPage";

export default async function EventGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const group = await getOwnedEventGroup((await params).id);

  if (!group) {
    notFound();
  }

  return (
    <Auth>
      <Header title="イベント詳細" />
      <EventGroupDetailPage group={group} />
    </Auth>
  );
}
