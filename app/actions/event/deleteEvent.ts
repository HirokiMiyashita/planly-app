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
      select: { id: true, createdBy: true },
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

    // イベントと関連するスロット、参加状況を削除
    await prisma.event.delete({
      where: { id: parseInt(eventId, 10) },
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
