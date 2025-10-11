"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <Card 
      className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          {event.isConfirmed && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              確定済み
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>{event.slots.length}件の候補日時</span>
            {isCreator && (
              <Badge variant="outline" className="text-xs">
                作成者
              </Badge>
            )}
          </div>
          <span className="text-xs">
            {formatDate(event.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
