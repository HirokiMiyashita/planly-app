"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * 参加するイベント（未来のイベント）を取得
 * - 未確定・確定問わず、未来のスロットに参加しているイベントを取得
 * - slotsの日付で判定するため、未確定イベントも含まれる
 */
export async function getUpcomingEvents() {
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
      confirmedSlot: true, // 確定スロット情報も取得
    },
    where: {
      // 未来のスロット（今日以降）に参加しているイベント
      slots: {
        some: {
          day: { gte: today }, // 今日以降のスロット
          participations: {
            some: {
              userId: lineUserId, // 現在のユーザーが参加
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
        createdAt: participation.createdAt.toISOString(),
        updatedAt: participation.updatedAt.toISOString(),
      })),
    })),
  }));
}
