"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteEvent } from "@/app/actions/event/deleteEvent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/types/event";
import EventDetails from "./EventDetails";
import EventEditForm from "./EventEditForm";

interface EventDetailPageProps {
  event: Event;
  isCreator?: boolean;
}

export default function EventDetailPage({ event, isCreator = false }: EventDetailPageProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleEditSuccess = () => {
    setShowEditForm(false);
    // ページをリロードして最新の状態を反映
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteEvent(event.id.toString());
      
      if (result.success) {
        toast.success("イベントを削除しました", {
          className: "bg-green-500 text-white",
        });
        router.push("/myEvents");
      } else {
        toast.error(result.message, {
          className: "bg-red-500 text-white",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("削除に失敗しました", {
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* イベント基本情報 */}
      <Card>
        <CardHeader>
          <div className="justify-between items-start">
            <div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              {event.isConfirmed && (
                <Badge className="bg-green-100 text-green-800 mt-2">
                  確定済み
                </Badge>
              )}
            </div>
            {isCreator ? (
              <div className="space-y-2 mt-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleInvite}
                  >
                    招待URLをコピー
                  </Button>
                  {!event.isConfirmed && (
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => setShowEditForm(!showEditForm)}
                    >
                      {showEditForm ? "編集を閉じる" : "編集"}
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  イベントを削除
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  size="sm"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => router.push(`/participation/${event.id}`)}
                >
                  回答を変更
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {event.description && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">説明</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}
          <div className="text-sm text-gray-500">
            作成日: {formatDate(event.created_at)}
          </div>
        </CardContent>
      </Card>

      {/* 編集フォーム */}
      {isCreator && showEditForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">イベント編集</CardTitle>
          </CardHeader>
          <CardContent>
            <EventEditForm
              event={event}
              onClose={() => setShowEditForm(false)}
              onSuccess={handleEditSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* 参加状況・候補日時 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">参加状況・候補日時</CardTitle>
        </CardHeader>
        <CardContent>
          <EventDetails event={event} isCreator={isCreator} />
        </CardContent>
      </Card>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">イベントを削除</h3>
            <p className="text-gray-700 mb-6">
              「{event.title}」を削除しますか？<br />
              この操作は取り消すことができません。
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {isDeleting ? "削除中..." : "削除"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
