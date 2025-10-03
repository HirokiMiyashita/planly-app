"use server";

import { createEventConfirmedMessage, sendPushMessage } from "@/lib/line-api";
import { prisma } from "@/lib/prisma";

export async function confirmed(eventId: string, slotId: string) {
  try {
    // イベントと確定スロットの情報を取得
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) },
      include: {
        slots: {
          where: { id: parseInt(slotId, 10) },
          include: {
            participations: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return { success: false, message: "イベントが見つかりません" };
    }

    const confirmedSlot = event.slots[0];
    if (!confirmedSlot) {
      return { success: false, message: "確定するスロットが見つかりません" };
    }

    // イベントを確定
    await prisma.event.update({
      where: { id: parseInt(eventId, 10) },
      data: {
        isConfirmed: true,
        confirmedAt: new Date(),
        confirmedSlotId: parseInt(slotId, 10),
      },
    });

    // 参加者にLINEメッセージを送信（参加状況に応じて個別送信）
    const confirmedDate = new Date(confirmedSlot.day).toLocaleDateString(
      "ja-JP",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      },
    );
    const confirmedTime = `${confirmedSlot.startAt} - ${confirmedSlot.endAt}`;

    let successCount = 0;
    let totalCount = 0;

    for (const participation of confirmedSlot.participations) {
      if (participation.user.id) {
        totalCount++;

        const message = createEventConfirmedMessage(
          event.title,
          confirmedDate,
          confirmedTime,
          participation.status,
        );

        const result = await sendPushMessage(participation.user.id, message);

        if (result.success) {
          successCount++;
        } else {
          console.error(
            `ユーザー ${participation.user.name} への送信失敗:`,
            result.error,
          );
        }
      }
    }

    if (totalCount > 0) {
      console.log(`LINE通知送信完了: ${successCount}/${totalCount}人`);
    }

    return { success: true, message: "イベントを確定しました" };
  } catch (error) {
    console.error("Error in confirmed action:", error);
    return { success: false, message: "イベントの確定に失敗しました" };
  }
}
