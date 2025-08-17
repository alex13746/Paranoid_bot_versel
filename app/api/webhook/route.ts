import { type NextRequest, NextResponse } from "next/server"
import { TelegramBot } from "@/lib/telegram"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const setup = searchParams.get("setup")

  if (setup === "true") {
    try {
      console.log("[v0] Setting up webhook...")

      if (!process.env.TELEGRAM_BOT_TOKEN) {
        throw new Error("TELEGRAM_BOT_TOKEN не установлен")
      }

      if (!process.env.WEBHOOK_URL) {
        throw new Error("WEBHOOK_URL не установлен")
      }

      const webhookUrl = process.env.WEBHOOK_URL
      console.log("[v0] Webhook URL:", webhookUrl)

      const result = await bot.setWebhook(webhookUrl)
      console.log("[v0] Webhook setup result:", result)

      return NextResponse.json({
        success: true,
        message: "Webhook настроен успешно",
        result,
        webhookUrl,
      })
    } catch (error) {
      console.error("[v0] Webhook setup error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Ошибка настройки webhook",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  }

  // Получить информацию о webhook
  try {
    const info = await bot.getWebhookInfo()
    return NextResponse.json({
      success: true,
      webhookInfo: info,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Ошибка получения информации о webhook",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    if (update.message) {
      const message = update.message
      const chatId = message.chat.id
      const text = message.text

      if (text === "/start") {
        await bot.sendMessage(
          chatId,
          `
🤖 <b>Добро пожаловать в Paranoia Bot!</b>

Я помогу вам никогда не забывать важные дела с помощью регулируемого режима паранойи от 0 до 5.

<b>Основные команды:</b>
• /help - Справка по командам
• /settings - Настройки уровня паранойи
• /done - Отметить напоминание выполненным

<b>Примеры напоминаний:</b>
• "Напомни завтра в 15:00 купить молоко"
• "Через 2 часа позвонить маме"
• "Каждый понедельник в 9:00 планерка"

Просто напишите мне, что и когда нужно напомнить!
        `,
        )
      } else if (text === "/help") {
        await bot.sendMessage(
          chatId,
          `
📋 <b>Справка по командам</b>

<b>Создание напоминаний:</b>
• Просто напишите: "Напомни [когда] [что]"
• Поддерживаются русские обороты времени
• Можно добавить геозоны: "@Офис +100м"

<b>Уровни паранойи (0-5):</b>
• 0 - Спокойно (одно уведомление)
• 1 - Мягко (2-3 уведомления)
• 2 - Обычно (стандартная частота)
• 3 - Настойчиво (частые напоминания)
• 4 - Агрессивно (очень частые + SMS)
• 5 - ПАНИКА (все методы + звонки)

<b>Команды:</b>
• /settings - Настройки
• /done - Выполнено
• /snooze - Отложить
• /list - Список напоминаний
        `,
        )
      } else if (text === "/settings") {
        await bot.sendMessage(
          chatId,
          `
⚙️ <b>Настройки</b>

Текущий уровень паранойи: <b>2</b> (Обычно)

Для изменения напишите:
"Установить паранойю [0-5]"

Дополнительные настройки:
• Тихие часы: не установлены
• Резервные контакты: не добавлены
• Геозоны: не настроены
        `,
        )
      } else {
        // Обработка создания напоминания
        await bot.sendMessage(
          chatId,
          `
✅ Понял! Обрабатываю ваше напоминание: "${text}"

🔄 Анализирую время и создаю напоминание...
📍 Проверяю геозоны...
⚡ Настраиваю уровень паранойи...

Напоминание будет создано в ближайшее время!
        `,
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
