import Link from "next/link";
import { getEventGroup } from "@/app/actions/event/getEventGroup";
import Auth from "@/components/features/auth/Auth";
import GroupParticipationForm from "@/components/features/participation/GroupParticipationForm";

export default async function GroupParticipationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const group = await getEventGroup((await params).token);
  if (!group)
    return (
      <main className="p-4">
        <h1 className="text-xl font-bold">招待リンクが無効です</h1>
      </main>
    );
  return (
    <Auth>
      <main className="min-h-screen bg-gray-100 pb-20">
        <div className="bg-red-500 px-4 py-5 text-white">
          <div className="flex items-center justify-between">
            <Link href="/attendEvent" className="text-xl leading-none">
              ←
            </Link>
            <h1 className="text-xl font-bold tracking-wide">イベント回答</h1>
            <Link href="/" className="text-xl leading-none">
              ×
            </Link>
          </div>
        </div>

        <div className="border-b bg-white px-4 py-4">
          <p className="text-xs font-medium text-red-500">複数イベントの招待</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {group.title}
          </h2>
          {group.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
              {group.description}
            </p>
          )}
        </div>

        <div className="space-y-4 px-4 py-4">
          <GroupParticipationForm group={group} />
        </div>
      </main>
    </Auth>
  );
}
