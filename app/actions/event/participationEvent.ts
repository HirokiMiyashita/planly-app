"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export enum ParticipationStatus {
  YES = "○",
  MAYBE = "△",
  NO = "×",
}

export interface ParticipationData {
  slotId: number;
  status: ParticipationStatus;
  comment?: string;
}

export async function participationEvent(
  eventId: string,
  participations: ParticipationData[],
) {
  try {
    const session = await getServerSession(authOptions);

    // セッションからlineUserIdを取得
    const lineUserId = session?.user?.lineUserId;
    if (!lineUserId) {
      return { success: false, message: "ログインが必要です" };
    }

    // イベントが存在するか確認
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) },
      include: { slots: true },
    });

    if (!event) {
      return { success: false, message: "イベントが見つかりません" };
    }

    // 各スロットの参加状況を保存
    for (const participation of participations) {
      // スロットがこのイベントに属しているか確認
      const slot = event.slots.find((s) => s.id === participation.slotId);
      if (!slot) {
        continue; // 無効なスロットIDはスキップ
      }

      // 既存の参加状況を更新または新規作成
      await prisma.eventParticipation.upsert({
        where: {
          eventId_slotId_userId: {
            eventId: parseInt(eventId, 10),
            slotId: participation.slotId,
            userId: lineUserId,
          },
        },
        update: {
          status: participation.status,
          comment: participation.comment || "",
          updatedAt: new Date(),
        },
        create: {
          eventId: parseInt(eventId, 10),
          userId: lineUserId,
          slotId: participation.slotId,
          status: participation.status,
          comment: participation.comment || "",
        },
      });
    }

    return { success: true, message: "参加状況を保存しました" };
  } catch (error) {
    console.error("参加状況保存エラー:", error);
    return { success: false, message: "サーバーエラーが発生しました" };
  }
}
