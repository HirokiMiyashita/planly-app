import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getAttendEvent(before: boolean = false) {
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
      confirmedSlot: true,
    },
    where: {
      isConfirmed: true,
      confirmedSlot: {
        day: before
          ? { lt: today } // 過去のイベント（今日より前）
          : { gte: today }, // 未来のイベント（今日以降）
      },
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
        createdAt: participation.createdAt.toISOString(),
        updatedAt: participation.updatedAt.toISOString(),
      })),
    })),
  }));
}
