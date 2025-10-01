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
            where: {
              userId: lineUserId,
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
  return events;
}
