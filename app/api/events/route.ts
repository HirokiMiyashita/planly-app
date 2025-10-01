import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventName,
      description,
      candidateDates,
      defaultStartTime,
      defaultEndTime,
    } = body;

    // NextAuth.jsセッションからユーザー情報を取得
    const session = await getServerSession(authOptions);

    if (!session?.user?.lineUserId) {
      return NextResponse.json(
        { success: false, message: "ログインが必要です" },
        { status: 401 },
      );
    }

    // Prismaを使用してイベントとスロットを作成
    const event = await prisma.event.create({
      data: {
        title: eventName,
        description: description,
        createdBy: session.user.lineUserId,
        slots: {
          create:
            candidateDates && candidateDates.length > 0
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
                    startAt: defaultStartTime || "09:00",
                    endAt: defaultEndTime || "10:00",
                  },
                ],
        },
      },
      include: {
        slots: true,
      },
    });

    const eventId = event.id;
    const savedSlots = event.slots.map((slot) => slot.id);

    return NextResponse.json({
      success: true,
      eventId: eventId,
      slotIds: savedSlots,
      message: "イベントが正常に保存されました",
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "データベースエラーが発生しました" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Prismaを使用してイベント一覧を取得
    const events = await prisma.event.findMany({
      include: {
        slots: {
          orderBy: [{ day: "asc" }, { startAt: "asc" }],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // データを整形
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      created_at: event.createdAt.toISOString(),
      slots: event.slots.map((slot) => ({
        id: slot.id,
        day: slot.day.toISOString().split("T")[0],
        start_at: slot.startAt,
        end_at: slot.endAt,
      })),
    }));

    return NextResponse.json({ success: true, events: formattedEvents });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { success: false, message: "データベースエラーが発生しました" },
      { status: 500 },
    );
  }
}
