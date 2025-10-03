## 一旦テストで10月末に本番リリース

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## LINE認証のローカル開発

### 環境変数ベースの設定

このプロジェクトでは、`NEXTAUTH_URL`環境変数を直接参照してLINE認証の設定を行います：

- **ローカル開発**: `.env.local`の`NEXTAUTH_URL`を使用
- **本番環境**: Vercelの環境変数`NEXTAUTH_URL`を使用

### ローカル開発用トンネル

ngrokのリクエスト制限を回避するため、以下の代替手段を用意しています：

#### 1. Cloudflare Tunnel（推奨）
```bash
pnpm run tunnel
```
- 無料で制限なし
- 高速で安定

#### 2. LocalTunnel
```bash
pnpm run lt
```
- 無料で制限なし
- カスタムサブドメイン使用可能

### 環境変数の設定

**ローカル開発時:**
```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev"
NEXTAUTH_URL="http://localhost:3000"  # またはトンネルURL
TUNNEL_URL="https://your-tunnel.trycloudflare.com"  # トンネル使用時
```

**本番環境:**
```bash
# Vercelダッシュボードで設定
NEXTAUTH_URL="https://your-app.vercel.app"
```

### LINE認証の動作

- **ローカル**: `.env.local`の`NEXTAUTH_URL`を直接使用
- **トンネル使用時**: `.env.local`の`NEXTAUTH_URL`をトンネルURLに変更
- **本番**: Vercelの環境変数`NEXTAUTH_URL`を直接使用

## データベース管理

### Prismaを使用したマイグレーション（推奨）

このプロジェクトでは、Prismaを使用してデータベーススキーマを管理しています。

#### 基本的な開発フロー

```bash
# 1. スキーマファイルを編集
# prisma/schema.prisma を編集

# 2. マイグレーションを生成・実行
pnpm run db:prisma-migrate --name [変更内容の説明]

# 3. Prismaクライアントを生成（必要に応じて）
pnpm run db:prisma-generate
```

#### 利用可能なコマンド

- `pnpm run db:prisma-migrate --name [名前]` - マイグレーションを生成・実行
- `pnpm run db:prisma-generate` - Prismaクライアントを生成
- `pnpm run db:prisma-push` - スキーマを直接データベースに適用（開発用）

#### 使用例

**カラムを追加する場合:**
```bash
# 1. prisma/schema.prisma で updatedAt フィールドを追加
# 2. マイグレーション実行
pnpm run db:prisma-migrate --name add_updated_at
```

**カラムを削除する場合:**
```bash
# 1. prisma/schema.prisma から updatedAt フィールドを削除
# 2. マイグレーション実行
pnpm run db:prisma-migrate --name remove_updated_at
```

**新しいテーブルを追加する場合:**
```bash
# 1. prisma/schema.prisma に新しいmodelを追加
# 2. マイグレーション実行
pnpm run db:prisma-migrate --name add_new_table
```

#### Prismaの利点

- **自動SQL生成**: スキーマファイルから自動でマイグレーションSQLを生成
- **型安全性**: TypeScriptで型安全なデータベース操作
- **変更履歴管理**: マイグレーション履歴の自動管理
- **データ損失防止**: 危険な操作に対する警告

### 手動データベース操作（緊急時のみ）

```bash
# テーブル構造を確認
pnpm run db:utils check [テーブル名]

# カラムを追加
pnpm run db:utils add [テーブル名] [カラム名] [型]

# カラムを削除
pnpm run db:utils drop [テーブル名] [カラム名]

# 全テーブル一覧
pnpm run db:utils list
```

### データベース環境の使い分け

このプロジェクトでは、開発時と本番時で異なるデータベースを使用します。

#### ローカル開発環境

**Docker PostgreSQLを使用（推奨）:**
```bash
# 1. ローカルPostgreSQLを起動
pnpm run db:local:start

# 2. 環境変数をローカル用に設定
# .env.local で DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev"

# 3. マイグレーション実行
DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev" pnpm run db:prisma-migrate --name [変更内容]

# 4. アプリケーション起動
DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev" pnpm run dev

# 5. Prisma Studioでデータ確認（別ターミナル）
DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev" pnpm run db:studio
```

**SQLiteを使用（最も簡単）:**
```bash
# 1. スキーマをSQLite用に変更
cp prisma/schema.local.prisma prisma/schema.prisma

# 2. 環境変数をSQLite用に設定
# .env.local で DATABASE_URL="file:./dev.db"

# 3. マイグレーション実行
pnpm run db:prisma-migrate --name [変更内容]

# 4. アプリケーション起動
pnpm run dev
```

#### 本番環境

**Neon PostgreSQLを使用:**
```bash
# 1. 環境変数を本番用に設定
# .env.local で DATABASE_URL="postgresql://neondb_owner:...@ep-xxx.neon.tech/neondb?sslmode=require"

# 2. 本番DBにマイグレーション実行
pnpm run db:prisma-migrate --name [変更内容]

# 3. デプロイ
git push origin main
```

#### 環境別のメリット

| 環境 | データベース | メリット | 用途 |
|------|-------------|----------|------|
| **ローカル** | Docker PostgreSQL / SQLite | 高速、リセット可能、本番DBを汚さない | 開発・テスト |
| **本番** | Neon PostgreSQL | クラウド、永続化、本番データ | 実際のサービス |

#### ローカル開発用コマンド

```bash
# ローカルPostgreSQL管理
pnpm run db:local:start    # 起動
pnpm run db:local:stop     # 停止
pnpm run db:local:reset    # リセット（データ削除）

# データベース操作
pnpm run db:prisma-migrate --name [名前]  # マイグレーション作成・実行
pnpm run db:prisma-generate              # Prismaクライアント生成
pnpm run db:studio                       # Prisma Studio起動
```

#### 環境変数の分岐

**自動分岐ロジック:**
- **ローカル開発**: `localhost`または`file:`を含むDATABASE_URL
- **本番環境**: `neon.tech`を含むDATABASE_URLまたは`NODE_ENV=production`

**設定方法:**

1. **ローカル開発時**:
   ```bash
   # .env.local
   DATABASE_URL="postgresql://postgres:password@localhost:5432/planly_dev"
   NEXTAUTH_URL="http://localhost:3000"
   TUNNEL_URL="https://your-tunnel.trycloudflare.com"  # トンネル使用時
   ```

2. **本番環境（Vercel）**:
   ```bash
   # Vercelダッシュボードで設定
   DATABASE_URL="postgresql://neondb_owner:...@ep-xxx.neon.tech/neondb?sslmode=require"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="your-secret-key"
   ```

3. **GitHub Actions**:
   ```bash
   # GitHub Secretsで設定
   DATABASE_URL=postgresql://neondb_owner:...@ep-xxx.neon.tech/neondb?sslmode=require
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-secret-key
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   ```

## バリデーション機能

### Zustandを使ったバリデーションシステム

アプリケーションでは、Zustandを使用してクライアントサイドのバリデーションを管理しています。

#### バリデーションストア (`stores/validationStore.ts`)

```typescript
interface ValidationState {
  errors: Record<string, string>;
  setError: (field: string, message: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: () => boolean;
  getError: (field: string) => string | undefined;
}
```

#### 基本的な使い方

```typescript
import { useValidationStore } from "@/stores/validationStore";

function MyComponent() {
  const { setError, clearError, clearAllErrors, getError } = useValidationStore();
  
  // エラーを設定
  setError("email", "メールアドレスが正しくありません");
  
  // エラーをクリア
  clearError("email");
  
  // 全エラーをクリア
  clearAllErrors();
  
  // エラーメッセージを取得
  const emailError = getError("email");
  
  return (
    <div>
      <input type="email" />
      {emailError && <p className="text-red-500">{emailError}</p>}
    </div>
  );
}
```

#### 参加状況フォームでのバリデーション例

```typescript
// バリデーション関数
const validateParticipations = () => {
  clearAllErrors();
  let hasErrors = false;
  
  slots.forEach(slot => {
    if (participations[slot.id] === null || participations[slot.id] === undefined) {
      setError(`slot_${slot.id}`, "参加状況を選択してください");
      hasErrors = true;
    }
  });
  
  return !hasErrors;
};

// 参加状況更新時のエラークリア
const updateParticipation = (slotId: number, status: ParticipationStatus) => {
  setParticipations(prev => ({ ...prev, [slotId]: status }));
  
  // ステータスが選択されたらエラーをクリア
  if (status !== null) {
    clearError(`slot_${slotId}`);
  }
};
```

#### バリデーションの特徴

1. **リアルタイムエラークリア**: ユーザーが入力・選択すると自動でエラーがクリア
2. **フィールド別エラー管理**: 各フィールドごとに独立したエラーメッセージ
3. **グローバル状態**: コンポーネント間でエラー状態を共有
4. **型安全**: TypeScriptで型チェック

#### エラーメッセージの表示

```typescript
// エラーメッセージの表示例
{getError(`slot_${slot.id}`) && (
  <p className="text-xs text-red-500">
    {getError(`slot_${slot.id}`)}
  </p>
)}
```

#### CI/CDでの自動デプロイ

**GitHub Actions設定:**
- `main`ブランチにプッシュ時に自動デプロイ
- 環境変数はGitHub Secretsから自動取得
- Vercelに自動デプロイ

### スキーマファイル

- **`prisma/schema.prisma`**: Prismaスキーマ定義（本番用）
- **`prisma/schema.local.prisma`**: ローカル開発用SQLiteスキーマ

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
