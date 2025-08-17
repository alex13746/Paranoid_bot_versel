import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? "✅ Установлен" : "❌ Отсутствует",
      WEBHOOK_URL: process.env.WEBHOOK_URL ? "✅ Установлен" : "❌ Отсутствует",
      ADMIN_KEY: process.env.ADMIN_KEY ? "✅ Установлен" : "❌ Отсутствует",
    },
    urls: {
      webhook: process.env.WEBHOOK_URL || "не установлен",
      test: "https://v0-telegram-bot-creator-flame.vercel.app/api/test",
      debug: "https://v0-telegram-bot-creator-flame.vercel.app/api/debug",
    },
    botStatus: "Готов к работе",
  }

  return NextResponse.json(diagnostics)
}
