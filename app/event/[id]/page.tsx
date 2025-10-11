import { getServerSession } from "next-auth";
import { Suspense } from "react";
import { getEventById } from "@/app/actions/event/getEventById";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Auth from "@/components/features/auth/Auth";
import Header from "@/components/features/auth/Header";
import EventDetailPage from "@/components/features/event/EventDetailPage";

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

function LoadingSkeleton() {
  return (
    <div className="p-4 pb-20">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

async function EventDetail({ params }: EventDetailPageProps) {
  const event = await getEventById(params.id);
  const session = await getServerSession(authOptions);
  const isCreator = event?.createdBy === session?.user?.lineUserId;
  if (!event) {
    return (
      <div className="p-4 pb-20">
        <div className="text-center py-8">
          <p className="text-gray-500">イベントが見つかりません</p>
        </div>
      </div>
    );
  }

  return <EventDetailPage event={event} isCreator={isCreator} />;
}

export default function EventDetailPageRoute({ params }: EventDetailPageProps) {
  return (
    <Auth>
      <Header title="イベント詳細" />
      <Suspense fallback={<LoadingSkeleton />}>
        <EventDetail params={params} />
      </Suspense>
    </Auth>
  );
}
