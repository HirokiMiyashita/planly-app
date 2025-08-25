'use server';

import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export interface CreateEventData {
  eventName: string;
  description: string;
  candidateDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  defaultStartTime: string;
  defaultEndTime: string;
}

export async function createEvent(formData: FormData) {
  try {
    // フォームデータを取得
    const eventName = formData.get('eventName') as string;
    const description = formData.get('description') as string;
    const defaultStartTime = formData.get('defaultStartTime') as string;
    const defaultEndTime = formData.get('defaultEndTime') as string;
    
    // 候補日のデータを取得（JSON文字列として送信される想定）
    const candidateDatesJson = formData.get('candidateDates') as string;
    const candidateDates = candidateDatesJson ? JSON.parse(candidateDatesJson) : [];

    // バリデーション
    if (!eventName.trim()) {
      return { success: false, message: 'イベント名は必須です' };
    }

    // セッションからユーザー情報を取得
    const session = await getServerSession();
    
    if (!session?.user?.lineUserId) {
      return { success: false, message: 'ログインが必要です' };
    }

    // イベントを作成
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

    // ページを再検証
    revalidatePath('/');

    return { 
      success: true, 
      eventId: eventId,
      slotIds: savedSlots,
      message: 'イベントが正常に保存されました' 
    };

  } catch (error) {
    console.error('Server Action error:', error);
    return { 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    };
  }
}
