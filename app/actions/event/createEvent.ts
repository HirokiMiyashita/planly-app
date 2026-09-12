"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export interface CreateEventData {
  eventName: string;
  description: string;
  candidateDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export async function createEvent(formData: FormData) {
  try {
    // フォームデータを取得
    const eventName = formData.get("eventName") as string;
    const description = formData.get("description") as string;

    // 候補日のデータを取得（JSON文字列として送信される想定）
    const candidateDatesJson = formData.get("candidateDates") as string;
    const candidateDates = candidateDatesJson
      ? JSON.parse(candidateDatesJson)
      : [];

    // バリデーション
    if (!eventName.trim()) {
      return { success: false, message: "イベント名は必須です" };
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    const lineUserId =
      session?.user?.lineUserId ||
      session?.user?.id ||
      (process.env.LOCAL_GUEST_LOGIN === "true" ? "local_dev_user" : undefined);

    if (!lineUserId) {
      return { success: false, message: "ログインが必要です" };
    }

    const userId = lineUserId;

    if (
      process.env.LOCAL_GUEST_LOGIN === "true" &&
      userId === "local_dev_user"
    ) {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: "ローカルユーザー",
          isFriendAdded: false,
        },
      });
    }

    // Prismaを使用してイベントとスロットを作成
    const event = await prisma.event.create({
      data: {
        title: eventName,
        description: description,
        createdBy: userId,
        slots: {
          create:
            candidateDates.length > 0
              ? candidateDates.map(
                  (candidate: {
                    date: string;
                    startTime: string;
                    endTime: string;
                  }) => ({
                    day: new Date(candidate.date),
                    startAt: candidate.startTime,
                    endAt: candidate.endTime,
                  }),
                )
              : [
                  {
                    day: new Date(),
                    startAt: "09:00",
                    endAt: "10:00",
                  },
                ],
        },
      },
      include: {
        slots: true,
      },
    });

    // ページを再検証
    revalidatePath("/");

    return {
      success: true,
      eventId: event.id,
      slotIds: event.slots.map((slot) => slot.id),
      message: "イベントが正常に保存されました",
    };
  } catch (error) {
    console.error("Server Action error:", error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

export async function createEventGroup(formData: FormData) {
  try {
    const title = String(formData.get("title") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || null;
    const events = JSON.parse(String(formData.get("events") ?? "[]")) as Array<{
      title: string;
      description?: string;
      candidateDates: Array<{
        date: string;
        startTime: string;
        endTime: string;
      }>;
    }>;
    if (
      !title ||
      events.length < 2 ||
      events.some(
        (event) => !event.title.trim() || event.candidateDates.length === 0,
      )
    ) {
      return {
        success: false,
        message:
          "グループ名と、候補日時付きのイベントを2件以上入力してください",
      };
    }
    const session = await getServerSession(authOptions);
    const userId =
      session?.user?.lineUserId ||
      session?.user?.id ||
      (process.env.LOCAL_GUEST_LOGIN === "true" ? "local_dev_user" : undefined);
    if (!userId) return { success: false, message: "ログインが必要です" };
    if (userId === "local_dev_user") {
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: "ローカルユーザー",
          isFriendAdded: false,
        },
      });
    }
    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.eventGroup.create({
        data: {
          title,
          description,
          createdBy: userId,
          inviteToken: randomBytes(24).toString("hex"),
          events: {
            create: events.map((event) => ({
              title: event.title.trim(),
              description: event.description?.trim() || null,
              createdBy: userId,
              slots: {
                create: event.candidateDates.map((slot) => ({
                  day: new Date(slot.date),
                  startAt: slot.startTime,
                  endAt: slot.endTime,
                })),
              },
            })),
          },
        },
        select: { id: true, inviteToken: true },
      });
      return created;
    });
    revalidatePath("/myEvents");
    return {
      success: true,
      groupId: group.id,
      inviteToken: group.inviteToken,
      message: "イベントグループを作成しました",
    };
  } catch (error) {
    console.error("createEventGroup error:", error);
    return { success: false, message: "サーバーエラーが発生しました" };
  }
}

export async function addEventToGroup(
  groupId: string,
  event: {
    title: string;
    description?: string;
    candidateDates: Array<{
      date: string;
      startTime: string;
      endTime: string;
    }>;
  },
) {
  try {
    const title = event.title.trim();
    const candidateDates = event.candidateDates.filter((slot) => slot.date);
    if (!title || candidateDates.length === 0) {
      return {
        success: false,
        message: "イベント名と候補日時を入力してください",
      };
    }

    const hasInvalidTime = candidateDates.some(
      (candidate) =>
        new Date(`2000-01-01T${candidate.startTime}:00`) >=
        new Date(`2000-01-01T${candidate.endTime}:00`),
    );
    if (hasInvalidTime) {
      return {
        success: false,
        message: "開始時刻が終了時刻より前になるように設定してください。",
      };
    }

    const session = await getServerSession(authOptions);
    const userId =
      session?.user?.lineUserId ||
      session?.user?.id ||
      (process.env.LOCAL_GUEST_LOGIN === "true" ? "local_dev_user" : undefined);
    if (!userId) {
      return { success: false, message: "ログインが必要です" };
    }

    const group = await prisma.eventGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true, inviteToken: true },
    });
    if (!group) {
      return { success: false, message: "イベントグループが見つかりません" };
    }
    if (group.createdBy !== userId) {
      return {
        success: false,
        message: "このグループにイベントを追加する権限がありません",
      };
    }

    const created = await prisma.event.create({
      data: {
        title,
        description: event.description?.trim() || null,
        createdBy: userId,
        groupId: group.id,
        slots: {
          create: candidateDates.map((slot) => ({
            day: new Date(slot.date),
            startAt: slot.startTime,
            endAt: slot.endTime,
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/");
    revalidatePath("/myEvents");
    revalidatePath(`/event/group/${group.id}`);
    revalidatePath(`/participation/group/${group.inviteToken}`);

    return {
      success: true,
      eventId: created.id,
      message: "グループにイベントを追加しました",
    };
  } catch (error) {
    console.error("addEventToGroup error:", error);
    return { success: false, message: "サーバーエラーが発生しました" };
  }
}
