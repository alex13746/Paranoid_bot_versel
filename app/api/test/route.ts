import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Проверка переменных окружения
    const requiredEnvVars = {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      ADMIN_KEY: process.env.ADMIN_KEY,
      WEBHOOK_URL: process.env.WEBHOOK_URL,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: {
        variables: Object.keys(requiredEnvVars).reduce(
          (acc, key) => {
            acc[key] = requiredEnvVars[key as keyof typeof requiredEnvVars] ? "✅ Set" : "❌ Missing"
            return acc
          },
          {} as Record<string, string>,
        ),
        missing: missingVars,
      },
      services: {
        telegram: requiredEnvVars.TELEGRAM_BOT_TOKEN ? "✅ Ready" : "❌ Token missing",
        webhook: requiredEnvVars.WEBHOOK_URL ? "✅ Configured" : "❌ URL missing",
        admin: requiredEnvVars.ADMIN_KEY ? "✅ Protected" : "❌ Key missing",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
