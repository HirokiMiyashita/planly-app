// 環境変数の設定と分岐ロジック

export const config = {
  // データベース設定
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
    isLocal:
      process.env.DATABASE_URL?.includes("localhost") ||
      process.env.DATABASE_URL?.includes("file:"),
    isProduction:
      process.env.DATABASE_URL?.includes("neon.tech") ||
      process.env.NODE_ENV === "production",
  },

  // NextAuth設定
  auth: {
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
  },

  // 環境判定
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isVercel: process.env.VERCEL === "1",
};

// ログ出力（開発時のみ）
if (config.isDevelopment) {
  console.log("🔧 Environment Configuration:");
  console.log(
    `  - Database: ${config.database.isLocal ? "Local" : "Production"}`,
  );
  console.log(
    `  - Environment: ${config.isProduction ? "Production" : "Development"}`,
  );
  console.log(`  - Platform: ${config.isVercel ? "Vercel" : "Local"}`);
}
