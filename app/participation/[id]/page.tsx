import { use } from "react";
import Link from "next/link";
import { getEventById } from "@/app/actions/event/getEventById";
import Auth from "@/components/features/auth/Auth";
import ParticipationForm from "@/components/features/participation/ParticipationForm";

interface ParticipationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Participation({ params }: ParticipationPageProps) {
  const { id } = use(params);
  const event = use(getEventById(id));

  if (!event) {
    return (
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">イベントが見つかりません</h1>
        <p className="text-gray-600">
          指定されたイベントは存在しないか、削除されています。
        </p>
      </div>
    );
  }

  return (
    <Auth>
      <div className="min-h-screen bg-gray-100 pb-20">
        <div className="bg-red-500 text-white px-4 py-5">
          <div className="flex items-center justify-between">
            <Link href="/attendEvent" className="text-2xl leading-none">
              ←
            </Link>
            <h1 className="text-3xl font-bold tracking-wide">イベント</h1>
            <Link href="/" className="text-2xl leading-none">
              ×
            </Link>
          </div>
        </div>

        <div className="px-4 py-4 bg-white border-b">
          <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
          {event.description && (
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {event.description}
            </p>
          )}
        </div>

        <div className="px-4 py-4">
          {event.slots.length > 0 ? (
            <ParticipationForm
              slots={event.slots}
              eventId={id}
              currentUserParticipation={event.currentUserParticipation}
              isUserRegistered={event.isUserRegistered}
            />
          ) : (
            <p className="text-gray-500">候補日程が設定されていません。</p>
          )}
        </div>
      </div>
    </Auth>
  );
}
