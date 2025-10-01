"use server";

import { prisma } from "@/lib/prisma";
import type { UpdateEventData } from "@/types/event";

export const updateEvent = async (
  eventId: string,
  eventData: UpdateEventData,
) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) },
    });

    if (!event) {
      return { success: false, message: "イベントが見つかりません" };
    }

    // イベント情報を更新
    await prisma.event.update({
      where: { id: parseInt(eventId, 10) },
      data: {
        title: eventData.title,
        description: eventData.description,
      },
    });

    // スロットを更新
    const { slots } = eventData;

    // 既存のスロットIDを取得
    const existingSlots = await prisma.eventSlot.findMany({
      where: { eventId: parseInt(eventId, 10) },
      select: { id: true },
    });
    const existingSlotIds = existingSlots.map((slot) => slot.id);

    // 送信されたスロットのIDを取得（新規作成の場合はidが0またはundefined）
    const submittedSlotIds = slots
      .filter((slot) => slot.id && slot.id > 0)
      .map((slot) => slot.id);

    // 削除されたスロット（既存にあるが送信されていない）を削除
    const slotsToDelete = existingSlotIds.filter(
      (id) => !submittedSlotIds.includes(id),
    );
    if (slotsToDelete.length > 0) {
      await prisma.eventSlot.deleteMany({
        where: {
          id: { in: slotsToDelete },
          eventId: parseInt(eventId, 10),
        },
      });
    }

    // 各スロットを処理
    for (const slot of slots) {
      if (slot.id && slot.id > 0) {
        // 既存スロットの更新
        await prisma.eventSlot.update({
          where: { id: slot.id },
          data: {
            day: new Date(slot.day),
            startAt: slot.start_at,
            endAt: slot.end_at,
          },
        });
      } else {
        // 新規スロットの作成
        await prisma.eventSlot.create({
          data: {
            eventId: parseInt(eventId, 10),
            day: new Date(slot.day),
            startAt: slot.start_at,
            endAt: slot.end_at,
          },
        });
      }
    }

    return { success: true, message: "イベントを更新しました" };
  } catch (error) {
    console.error("イベント更新エラー:", error);
    return { success: false, message: "イベントの更新に失敗しました" };
  }
};
