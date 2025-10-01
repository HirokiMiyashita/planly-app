import { use } from "react";
import { getEventById } from "@/app/actions/event/getEventById";
import Header from "@/app/components/Header";
import ParticipationForm from "@/app/components/ParticipationForm";

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
    <div className="p-4 pb-20">
      <Header title="イベント参加" />
      <div className="space-y-6 mt-4">
        {/* イベント基本情報 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          {event.description && (
            <p className="text-gray-600 mb-3">{event.description}</p>
          )}
          <p className="text-sm text-gray-500">
            作成日: {new Date(event.created_at).toLocaleDateString("ja-JP")}
          </p>
        </div>

        {/* 候補日程 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">候補日程</h3>
          {event.slots.length > 0 ? (
            <ParticipationForm slots={event.slots} eventId={id} />
          ) : (
            <p className="text-gray-500">候補日程が設定されていません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
