"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getEventById(id: string) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);
    const lineUserId = session?.user?.lineUserId;

    // Prismaを使用してイベントとスロット、参加情報を取得
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id, 10),
      },
      include: {
        slots: {
          orderBy: [{ day: "asc" }, { startAt: "asc" }],
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
    });

    if (!event) {
      return null;
    }

    // データを整形
    return {
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
      // 現在のユーザーの参加状況を取得
      currentUserParticipation: lineUserId
        ? event.slots.flatMap((slot) =>
            slot.participations
              .filter((p) => p.userId === lineUserId)
              .map((participation) => ({
                id: participation.id,
                userId: participation.userId,
                userName: participation.user.name,
                status: participation.status,
                createdAt: participation.createdAt.toISOString(),
                updatedAt: participation.updatedAt.toISOString(),
              })),
          )
        : [],
      // 現在のユーザーが参加登録しているかどうか（全てのスロットで回答済みか）
      isUserRegistered: lineUserId
        ? event.slots.every((slot) =>
            slot.participations.some((p) => p.userId === lineUserId),
          )
        : false,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}
