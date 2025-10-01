"use server";

import { prisma } from "@/lib/prisma";

export async function confirmed(eventId: string, slotId: string) {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(eventId, 10) },
  });
  if (!event) {
    return { success: false, message: "イベントが見つかりません" };
  }
  await prisma.event.update({
    where: { id: parseInt(eventId, 10) },
    data: {
      isConfirmed: true,
      confirmedAt: new Date(),
      confirmedSlotId: parseInt(slotId, 10),
    },
  });
  return { success: true, message: "イベントを確定しました" };
}
