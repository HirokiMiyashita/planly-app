"use client";

import { CalendarDays, Copy, ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { addEventToGroup } from "@/app/actions/event/createEvent";
import type { getOwnedEventGroup } from "@/app/actions/event/getEventGroup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createBlankGroupEvent,
  type GroupEvent,
  GroupEventEditorModal,
} from "./GroupEventForm";

type EventGroup = NonNullable<Awaited<ReturnType<typeof getOwnedEventGroup>>>;

export default function EventGroupDetailPage({ group }: { group: EventGroup }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draftEvent, setDraftEvent] = useState<GroupEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const participationPath = `/participation/group/${group.inviteToken}`;

  const copyInviteUrl = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${participationPath}`,
      );
      toast.success("共通招待URLをコピーしました");
    } catch (error) {
      console.error(error);
      toast.error("招待URLのコピーに失敗しました");
    }
  };

  const openAddEvent = () => {
    setDraftEvent(createBlankGroupEvent());
  };

  const closeAddEvent = () => {
    if (isSaving) {
      return;
    }
    setDraftEvent(null);
  };

  const saveAddedEvent = async () => {
    if (!draftEvent) {
      return;
    }
    setIsSaving(true);
    try {
      const result = await addEventToGroup(group.id, {
        title: draftEvent.title,
        description: draftEvent.description,
        candidateDates: draftEvent.candidateDates,
      });
      if (result.success) {
        toast.success(result.message);
        setDraftEvent(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("イベントの追加に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">{group.title}</CardTitle>
            <Badge variant="outline" className="text-xs text-blue-700">
              複数イベント
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {group.description && (
            <p className="whitespace-pre-wrap text-gray-600">
              {group.description}
            </p>
          )}
          <p className="text-sm text-gray-500">
            作成日：
            {new Date(group.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </p>
          <div className="grid grid-cols-2 gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={copyInviteUrl}>
              <Copy className="size-4" />
              招待URLをコピー
            </Button>
            <Button asChild>
              <Link href={participationPath}>
                <ExternalLink className="size-4" />
                回答画面を確認
              </Link>
            </Button>
          </div>
          <Button
            type="button"
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing((current) => !current)}
            className="w-full"
          >
            <Pencil className="size-4" />
            {isEditing ? "編集を閉じる" : "編集"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            イベント一覧（{group.events.length}件）
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {group.events.map((event, index) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {event.title}
                  </span>
                  {event.isConfirmed && (
                    <Badge className="bg-green-100 text-xs text-green-800">
                      確定済み
                    </Badge>
                  )}
                </span>
                {event.description && (
                  <span className="mt-1 block line-clamp-1 text-sm text-gray-500">
                    {event.description}
                  </span>
                )}
                <span className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <CalendarDays className="size-3.5" />
                  候補日時 {event.slots.length}件
                </span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-gray-400" />
            </Link>
          ))}
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={openAddEvent}
              className="h-11 w-full border-dashed border-blue-300 text-blue-700 hover:border-blue-500 hover:bg-blue-50"
            >
              <Plus className="size-4" />
              イベントを追加
            </Button>
          )}
        </CardContent>
      </Card>

      {draftEvent && (
        <GroupEventEditorModal
          event={draftEvent}
          eventNumber={group.events.length + 1}
          title="イベントを追加"
          saveLabel="グループに追加"
          saving={isSaving}
          onChange={setDraftEvent}
          onCancel={closeAddEvent}
          onSave={saveAddedEvent}
        />
      )}
    </div>
  );
}
