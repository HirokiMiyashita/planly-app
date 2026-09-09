"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function deleteEvent(eventId: string) {
  try {
    // セッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    // セッションにlineUserIdがない場合、JWTトークンから直接取得
    let lineUserId = session?.user?.lineUserId;
    if (!lineUserId) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const token =
          cookieStore.get("next-auth.session-token")?.value ||
          cookieStore.get("__Secure-next-auth.session-token")?.value;

        if (token) {
          // JWTトークンをBase64デコード（署名検証なし）
          const payload = JSON.parse(
            Buffer.from(token.split(".")[1], "base64").toString(),
          );
          lineUserId = payload?.lineUserId;
        }
      } catch (error) {
        console.error("JWT decode error:", error);
      }
    }

    if (!lineUserId) {
      return { success: false, message: "ログインが必要です" };
    }

    // イベントが存在するかチェック
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId, 10) },
      select: { id: true, createdBy: true, groupId: true },
    });

    if (!event) {
      return { success: false, message: "イベントが見つかりません" };
    }

    // 作成者かどうかチェック
    if (event.createdBy !== lineUserId) {
      return {
        success: false,
        message: "このイベントを削除する権限がありません",
      };
    }

    // イベントを削除し、空になったグループも同じトランザクションで削除
    await prisma.$transaction(async (tx) => {
      await tx.event.delete({
        where: { id: event.id },
      });

      if (event.groupId) {
        await tx.eventGroup.deleteMany({
          where: {
            id: event.groupId,
            createdBy: lineUserId,
            events: { none: {} },
          },
        });
      }
    });

    // ページを再検証
    revalidatePath("/");
    revalidatePath("/myEvents");

    return {
      success: true,
      message: "イベントが正常に削除されました",
    };
  } catch (error) {
    console.error("Delete Event error:", error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}

export async function deleteEventGroup(groupId: string) {
  try {
    const session = await getServerSession(authOptions);
    const lineUserId = session?.user?.lineUserId;

    if (!lineUserId) {
      return { success: false, message: "ログインが必要です" };
    }

    const group = await prisma.eventGroup.findUnique({
      where: { id: groupId },
      select: { id: true, createdBy: true },
    });

    if (!group) {
      return { success: false, message: "イベントグループが見つかりません" };
    }

    if (group.createdBy !== lineUserId) {
      return {
        success: false,
        message: "このイベントグループを削除する権限がありません",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.event.deleteMany({
        where: { groupId: group.id },
      });
      await tx.eventGroup.delete({
        where: { id: group.id },
      });
    });

    revalidatePath("/");
    revalidatePath("/myEvents");

    return {
      success: true,
      message: "イベントグループを削除しました",
    };
  } catch (error) {
    console.error("Delete Event Group error:", error);
    return {
      success: false,
      message: "サーバーエラーが発生しました",
    };
  }
}
