#!/bin/bash

# Cloudflare Tunnel セットアップスクリプト
echo "🚀 Cloudflare Tunnel を開始しています..."

# 開発サーバーを起動
echo "📦 Next.js 開発サーバーを起動中..."
pnpm dev &
DEV_PID=$!

# 少し待ってからトンネルを開始
sleep 3

echo "🌐 Cloudflare Tunnel を開始中..."
cloudflared tunnel --url http://localhost:3000

# 終了時にプロセスをクリーンアップ
trap "kill $DEV_PID" EXIT
