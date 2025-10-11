"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// 型定義
export interface Participation {
  id: number;
  userId: string;
  userName: string | null;
  status: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: number;
  day: string;
  start_at: string;
  end_at: string;
  participations: Participation[];
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  isConfirmed: boolean;
  confirmedSlotId: number | null;
  slots: Slot[];
}

export async function getMyEvent(): Promise<Event[]> {
  const session = await getServerSession(authOptions);

  // セッションからlineUserIdを取得
  const lineUserId = session?.user?.lineUserId;
  if (!lineUserId) {
    return [];
  }

  // Prismaを使用してイベントとスロット、参加状況を取得（最適化）
  const events = await prisma.event.findMany({
    where: {
      createdBy: lineUserId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      isConfirmed: true,
      confirmedSlotId: true,
      slots: {
        select: {
          id: true,
          day: true,
          startAt: true,
          endAt: true,
          participations: {
            select: {
              id: true,
              userId: true,
              status: true,
              comment: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [{ day: "asc" }, { startAt: "asc" }],
      },
    },
    orderBy: {
      createdAt: "desc",
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
        comment: participation.comment,
        status: participation.status,
        createdAt: participation.createdAt.toISOString(),
        updatedAt: participation.updatedAt.toISOString(),
      })),
    })),
  }));
}
