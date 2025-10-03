"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Event } from "@/types/event";
import EventDetails from "./EventDetails";
import EventEditForm from "./EventEditForm";

interface EventCardProps {
  event: Event;
  isCreator: boolean;
}

export default function EventCard({ event, isCreator }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const router = useRouter();

  const handleInvite = async () => {
    try {
      const inviteUrl = `${window.location.origin}/participation/${event.id}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success(`招待URLをコピーしました`, {
        className: "bg-green-500 text-white",
      });
    } catch (error) {
      console.error(error);
      toast.error("コピーに失敗しました", {
        className: "bg-red-500 text-white",
      });
    }
  };

  const handleEdit = () => {
    setShowEditForm(!showEditForm);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    // ページをリロードして最新の状態を反映
    router.refresh();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="text-xs px-2 py-1 inline-block mb-0.5 bg-gray-500 font-bold">
              イベント名
            </Badge>
            <p className="text-gray-600 text-xs">{event.title}</p>
          </div>
          {event.isConfirmed && (
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              ✓ 確定済み
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Badge className="text-xs px-2 py-1 inline-block mb-0.5 bg-gray-500 font-bold">
            イベント詳細
          </Badge>
          <p className="text-gray-600 text-xs">
            {event.description || "説明なし"}
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "参加状況を閉じる" : "参加状況を見る"}
          </Button>
          {isCreator && !event.isConfirmed && (
            <>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleInvite}
              >
                招待
              </Button>
              {!event.isConfirmed && (
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={handleEdit}
                >
                  {showEditForm ? "編集を閉じる" : "編集"}
                </Button>
              )}
            </>
          )}
        </div>

        {/* 編集フォーム表示 */}
        {showEditForm && (
          <EventEditForm
            event={event}
            onClose={() => setShowEditForm(false)}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* 詳細表示 */}
        {showDetails && <EventDetails event={event} isCreator={isCreator} />}
      </CardContent>
    </Card>
  );
}
