import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Neon Database接続
const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    console.log('LINE user API called');
    
    const body = await request.json();
    const { accessToken } = body;

    console.log('Access token received:', accessToken ? 'Yes' : 'No');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: 'アクセストークンが必要です' },
        { status: 400 }
      );
    }

    // LINE APIからユーザー情報を取得
    console.log('Calling LINE API...');
    const response = await fetch('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('LINE API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE API error response:', errorText);
      throw new Error(`LINE API request failed: ${response.status} - ${errorText}`);
    }

    const userData = await response.json();
    console.log('LINE API user data:', userData);

    // データベースにユーザー情報を保存（既存の場合は登録しない）
    try {
      await sql`
        INSERT INTO users (id, name, created_at)
        VALUES (${userData.userId}, ${userData.displayName}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
      console.log('User data saved to database (or already exists)');
    } catch (dbError) {
      console.error('Database error:', dbError);
      // データベースエラーでもユーザー情報は返す
    }

    return NextResponse.json({
      success: true,
      userName: userData.displayName,
      userId: userData.userId,
      pictureUrl: userData.pictureUrl,
    });

  } catch (error) {
    console.error('LINE API error:', error);
    return NextResponse.json(
      { success: false, message: 'LINE APIエラーが発生しました' },
      { status: 500 }
    );
  }
}
