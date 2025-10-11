// 環境変数ベースのLINE認証設定
export const authConfig = {
  // NEXTAUTH_URLを直接使用
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // LINE認証のコールバックURL
  callbackUrl: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback/line`,

  // LINE認証のリダイレクトURL
  redirectUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // トンネルURL（ローカル開発時）
  tunnelUrl: process.env.TUNNEL_URL,
};
