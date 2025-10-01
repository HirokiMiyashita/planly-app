"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function getMyEvent() {
  const session = await getServerSession(authOptions);

  // セッションからlineUserIdを取得
  let lineUserId = session?.user?.lineUserId;
  if (!lineUserId) {
    return [];
  }

  // Prismaを使用してイベントとスロット、参加状況を取得
  const events = await prisma.event.findMany({
    where: {
      createdBy: lineUserId,
    },
    include: {
      slots: {
        orderBy: [
          { day: 'asc' },
          { startAt: 'asc' }
        ],
        include: {
          participations: {
            where: {
              status: "○",
              userId: lineUserId
            },
            include: {
              user: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // データを整形
  return events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    created_at: event.createdAt.toISOString(),
    isConfirmed: event.isConfirmed,
    confirmedSlotId: event.confirmedSlotId,
    slots: event.slots.map(slot => ({
      id: slot.id,
      day: slot.day.toISOString().split('T')[0],
      start_at: slot.startAt,
      end_at: slot.endAt,
      participations: slot.participations.map(participation => ({
        id: participation.id,
        userId: participation.userId,
        userName: participation.user.name,
        status: participation.status,
        createdAt: participation.createdAt.toISOString(),
        updatedAt: participation.updatedAt.toISOString()
      }))
    }))
  }));
}
