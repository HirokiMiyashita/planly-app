#!/bin/bash

# LocalTunnel セットアップスクリプト
echo "🚀 LocalTunnel を開始しています..."

# 開発サーバーを起動
echo "📦 Next.js 開発サーバーを起動中..."
pnpm dev &
DEV_PID=$!

# 少し待ってからトンネルを開始
sleep 3

echo "🌐 LocalTunnel を開始中..."
lt --port 3000 --subdomain planly-app-dev

# 終了時にプロセスをクリーンアップ
trap "kill $DEV_PID" EXIT
