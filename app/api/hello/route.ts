export async function GET() {
  return Response.json({
    message: "API работает!",
    timestamp: new Date().toISOString(),
    env: {
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasAdminKey: !!process.env.ADMIN_KEY,
      hasWebhookUrl: !!process.env.WEBHOOK_URL,
    },
  })
}
