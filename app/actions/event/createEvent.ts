"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export interface CreateEventData {
  eventName: string;
  description: string;
  candidateDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export async function createEvent(formData: FormData) {
  try {
    // フォームデータを取得
    const eventName = formData.get("eventName") as string;
    const description = formData.get("description") as string;

    // 候補日のデータを取得（JSON文字列として送信される想定）
    const candidateDatesJson = formData.get("candidateDates") as string;
    const candidateDates = candidateDatesJson
      ? JSON.parse(candidateDatesJson)
      : [];

    // バリデーション
    if (!eventName.trim()) {
      return { success: false, message: "イベント名は必須です" };
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    const lineUserId = session?.user?.lineUserId || session?.user?.id;

    if (!lineUserId) {
      return { success: false, message: "ログインが必要です" };
    }

    const userId = lineUserId;

    // Prismaを使用してイベントとスロットを作成
    const event = await prisma.event.create({
      data: {
        title: eventName,
        description: description,
        createdBy: userId,
        slots: {
          create:
            candidateDates.length > 0
              ? candidateDates.map(
                  (candidate: {
                    date: string;
                    startTime: string;
                    endTime: string;
                  }) => ({
                    day: new Date(candidate.date),
                    startAt: candidate.startTime,
                    endAt: candidate.endTime,
                  }),
                )
              : [
                  {
                    day: new Date(),
                    startAt: "09:00",
                    endAt: "10:00",
                  },
                ],
        },
      },
      include: {
        slots: true,
      },
    });

    // ページを再検証
    revalidatePath("/");

    return {
      success: true,
      eventId: event.id,
      slotIds: event.slots.map((slot) => slot.id),
      message: "イベントが正常に保存されました",
    };
  } catch (error) {
    console.error("Server Action error:", error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}
