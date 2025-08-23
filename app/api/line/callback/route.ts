import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('LINE callback request received');
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { success: false, message: '認証コードが必要です' },
        { status: 400 }
      );
    }

    // アクセストークンを取得
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://5d9ea260ba14.ngrok-free.app/api/line/callback',
        client_id: '2007979395',
        client_secret: '873845d7b4564e86374461b9220842b8',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token request failed:', tokenResponse.status, errorText);
      throw new Error(`Token request failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    // フロントエンドにリダイレクト（アクセストークン付き）
    const redirectUrl = `https://5d9ea260ba14.ngrok-free.app?access_token=${tokenData.access_token}`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('LINE callback error:', error);
    return NextResponse.json(
      { success: false, message: 'LINE認証エラーが発生しました' },
      { status: 500 }
    );
  }
}
