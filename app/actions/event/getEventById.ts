"use server";

import { prisma } from "@/lib/prisma";

export async function getEventById(id: string) {
  try {
    // Prismaを使用してイベントとスロットを取得
    const event = await prisma.event.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        slots: {
          orderBy: [
            { day: 'asc' },
            { startAt: 'asc' }
          ]
        }
      }
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
      slots: event.slots.map(slot => ({
        id: slot.id,
        day: slot.day.toISOString().split('T')[0],
        start_at: slot.startAt,
        end_at: slot.endAt,
      }))
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}
