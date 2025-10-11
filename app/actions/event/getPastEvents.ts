"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * 参加したイベント（過去のイベント）を取得
 * - 確定済みで、過去の確定スロットのイベントのみを取得
 * - confirmedSlotの日付で判定するため、確定済みイベントのみ
 */
export async function getPastEvents() {
  const session = await getServerSession(authOptions);
  const lineUserId = session?.user?.lineUserId;
  if (!lineUserId) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // 今日の開始時刻に設定

  const events = await prisma.event.findMany({
    include: {
      slots: {
        include: {
          participations: {
            include: {
              user: true,
            },
          },
        },
      },
      confirmedSlot: true, // 確定スロット情報を取得
    },
    where: {
      isConfirmed: true, // 確定済みのイベントのみ
      confirmedSlot: {
        day: { lt: today }, // 過去の確定スロット（今日より前）
      },
      // 現在のユーザーが参加しているイベント
      slots: {
        some: {
          participations: {
            some: {
              userId: lineUserId,
            },
          },
        },
      },
    },
  });

  // データを整形
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    created_at: event.createdAt.toISOString(),
    isConfirmed: event.isConfirmed,
    confirmedSlotId: event.confirmedSlotId,
    slots: event.slots.map((slot) => ({
      id: slot.id,
      day: slot.day.toISOString().split("T")[0],
      start_at: slot.startAt,
      end_at: slot.endAt,
      participations: slot.participations.map((participation) => ({
        id: participation.id,
        userId: participation.userId,
        userName: participation.user.name,
        status: participation.status,
        comment: participation.comment,
        createdAt: participation.createdAt.toISOString(),
        updatedAt: participation.updatedAt.toISOString(),
      })),
    })),
  }));
}
