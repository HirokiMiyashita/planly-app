"use client";

import { CalendarDays, Copy, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  isCreator: boolean;
}

export default function EventCard({ event, isCreator }: EventCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    // 詳細ページに遷移
    router.push(`/event/${event.id}`);
  };

  const handleInvite = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/participation/${event.id}`,
      );
      toast.success("招待URLをコピーしました");
    } catch (error) {
      console.error(error);
      toast.error("招待URLのコピーに失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <CalendarDays className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <Badge variant="outline" className="text-xs text-blue-700">
                単一イベント
              </Badge>
              {event.isConfirmed && (
                <Badge className="bg-green-100 text-xs text-green-800">
                  確定済み
                </Badge>
              )}
            </div>
            {event.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {event.description}
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
              <span>{event.slots.length}件の候補日時</span>
              <span className="shrink-0">{formatDate(event.created_at)}</span>
            </div>
          </div>
        </div>

        <div
          className={`mt-4 grid gap-2 border-t pt-4 ${
            isCreator ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {isCreator && (
            <Button type="button" variant="outline" onClick={handleInvite}>
              <Copy className="size-4" />
              招待URLをコピー
            </Button>
          )}
          <Button type="button" onClick={handleCardClick}>
            <ExternalLink className="size-4" />
            詳細を確認
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
