"use client";

import { CalendarDays, Copy, ExternalLink, Layers3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { EventGroup } from "@/app/actions/event/getMyEvent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EventGroupCard({ group }: { group: EventGroup }) {
  const invitePath = `/participation/group/${group.inviteToken}`;
  const slotCount = group.events.reduce(
    (total, event) => total + event.slots.length,
    0,
  );
  const createdAt = new Date(group.created_at).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const copyInviteUrl = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${invitePath}`,
      );
      toast.success("共通招待URLをコピーしました");
    } catch (error) {
      console.error(error);
      toast.error("招待URLのコピーに失敗しました");
    }
  };

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Layers3 className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{group.title}</h3>
              <Badge variant="outline" className="text-xs text-blue-700">
                複数イベント
              </Badge>
            </div>
            {group.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {group.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
              <span className="flex min-w-0 items-center gap-3">
                <span>{group.events.length}件のイベント</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5" />
                  候補 合計{slotCount}件
                </span>
              </span>
              <span className="shrink-0">{createdAt}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t pt-4">
          {group.events.map((event, index) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm transition-colors hover:bg-gray-100"
            >
              <span className="min-w-0 truncate">
                <span className="mr-2 text-xs text-gray-400">{index + 1}</span>
                {event.title}
              </span>
              <span className="shrink-0 text-xs text-gray-500">
                候補{event.slots.length}件
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={copyInviteUrl}>
            <Copy className="size-4" />
            招待URLをコピー
          </Button>
          <Button asChild>
            <Link href={`/event/group/${group.id}`}>
              <ExternalLink className="size-4" />
              詳細を確認
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
