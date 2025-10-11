"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRandomColors } from "@/hooks/useRandomColors";
import type { CandidateDate } from "@/types/event";

interface EventFormStep3Props {
  eventName: string;
  description: string;
  candidateDates: CandidateDate[];
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function EventFormStep3({
  eventName,
  description,
  candidateDates,
  onSubmit,
  isSubmitting = false,
}: EventFormStep3Props) {
  const { getColor } = useRandomColors({ count: 2 });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* イベント基本情報の確認 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">イベント基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-1">
                イベント名
              </h4>
              <p className="text-base">{eventName}</p>
            </div>
            {description && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-1">説明</h4>
                <p className="text-base text-gray-600 whitespace-pre-wrap">
                  {description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 候補日時の確認 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">開催候補日時</CardTitle>
          </CardHeader>
          <CardContent>
            {candidateDates.length > 0 ? (
              <div className="space-y-3">
                {candidateDates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {formatDate(candidate.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {candidate.startTime} - {candidate.endTime}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">{index + 1}</div>
                  </div>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  合計 {candidateDates.length} 件の候補日時
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                候補日時が設定されていません
              </p>
            )}
          </CardContent>
        </Card>

        {/* 登録ボタン */}
        <div className="pt-4">
          <Button
            onClick={onSubmit}
            variant="outline"
            size="lg"
            className="text-lg font-semibold relative overflow-hidden w-full py-4 h-auto"
            disabled={isSubmitting || !eventName || candidateDates.length === 0}
          >
            <span
              className={`absolute bottom-0 left-0 w-8 h-8 ${getColor(0)} rounded-tr-full`}
            ></span>
            <span
              className={`absolute top-0 right-0 w-8 h-8 ${getColor(1)} rounded-bl-full`}
            ></span>
            {isSubmitting ? "登録中..." : "イベントを作成"}
          </Button>
        </div>
      </div>
    </div>
  );
}
