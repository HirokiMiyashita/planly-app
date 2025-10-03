import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("LINE Webhook received:", JSON.stringify(body, null, 2));

    // メッセージイベントの処理
    if (body.events) {
      for (const event of body.events) {
        if (event.type === "message" && event.message.type === "text") {
          console.log("Message received:", {
            userId: event.source.userId,
            message: event.message.text,
            timestamp: event.timestamp,
          });

          // ここでユーザーIDを確認できます
          console.log("ユーザーID:", event.source.userId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET リクエストも処理（LINEからの検証用）
export async function GET() {
  return NextResponse.json({ message: "LINE Webhook is working" });
}
