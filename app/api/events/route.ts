import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';

// Neon Database接続
const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, description, candidateDates, defaultStartTime, defaultEndTime } = body;

    // NextAuth.jsセッションからユーザー情報を取得
    const session = await getServerSession();
    
    if (!session?.user?.lineUserId) {
      return NextResponse.json(
        { success: false, message: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // まずeventsテーブルにイベント情報を挿入
    const eventResult = await sql`
      INSERT INTO events (title, description, created_by)
      VALUES (${eventName}, ${description}, ${session.user.lineUserId})
      RETURNING id
    `;

    const eventId = eventResult[0].id;
    const savedSlots = [];

    // 候補日がある場合はevent_slotsテーブルに挿入
    if (candidateDates && candidateDates.length > 0) {
      for (const candidate of candidateDates) {
        const result = await sql`
          INSERT INTO event_slots (day, start_at, end_at, event_id)
          VALUES (${candidate.date}, ${candidate.startTime}, ${candidate.endTime}, ${eventId})
          RETURNING id
        `;

        savedSlots.push(result[0].id);
      }
    } else {
      // 候補日がない場合は、デフォルト時間で今日の日付を使用
      const today = new Date().toISOString().split('T')[0];
      const startTime = defaultStartTime || '09:00';
      const endTime = defaultEndTime || '10:00';

      const result = await sql`
        INSERT INTO event_slots (day, start_at, end_at, event_id)
        VALUES (${today}, ${startTime}, ${endTime}, ${eventId})
        RETURNING id
      `;

      savedSlots.push(result[0].id);
    }

    return NextResponse.json({ 
      success: true, 
      eventId: eventId,
      slotIds: savedSlots,
      message: 'イベントが正常に保存されました' 
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'データベースエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // イベント一覧を取得（event_slotsと結合）
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.created_at,
        json_agg(
          json_build_object(
            'id', es.id,
            'day', es.day,
            'start_at', es.start_at,
            'end_at', es.end_at
          )
        ) as slots
      FROM events e
      LEFT JOIN event_slots es ON e.id = es.event_id
      GROUP BY e.id, e.title, e.description, e.created_at
      ORDER BY e.created_at DESC
    `;

    return NextResponse.json({ success: true, events });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, message: 'データベースエラーが発生しました' },
      { status: 500 }
    );
  }
}
