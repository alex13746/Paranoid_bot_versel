"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function TelegramBotDashboard() {
  const [reminders, setReminders] = useState([
    { id: 1, text: "Купить молоко", time: "2024-01-15 15:00", paranoia: 3, status: "active" },
    { id: 2, text: "Встреча с клиентом", time: "2024-01-16 10:00", paranoia: 5, status: "active" },
  ])

  const [newReminder, setNewReminder] = useState({
    text: "",
    time: "",
    paranoia: 2,
    geozone: "",
  })

  const [apiStatus, setApiStatus] = useState<string>("Проверка...")

  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/status")
      const data = await response.json()
      setApiStatus(`✅ API работает: ${data.message}`)
    } catch (error) {
      setApiStatus(`❌ API недоступен: ${error}`)
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const handleCreateReminder = () => {
    if (newReminder.text && newReminder.time) {
      const reminder = {
        id: Date.now(),
        text: newReminder.text,
        time: newReminder.time,
        paranoia: newReminder.paranoia,
        status: "active",
      }
      setReminders([...reminders, reminder])
      setNewReminder({ text: "", time: "", paranoia: 2, geozone: "" })
    }
  }

  const getParanoiaColor = (level: number) => {
    if (level <= 1) return "bg-green-500"
    if (level <= 2) return "bg-blue-500"
    if (level <= 3) return "bg-yellow-500"
    if (level <= 4) return "bg-orange-500"
    return "bg-red-500"
  }

  const getParanoiaLabel = (level: number) => {
    const labels = ["Спокойно", "Мягко", "Обычно", "Настойчиво", "Агрессивно", "ПАНИКА"]
    return labels[level] || "Неизвестно"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Telegram Paranoia Bot</h1>
          <p className="text-muted-foreground">Система напоминаний с регулируемым режимом паранойи 0-5</p>
          <div className="text-sm font-mono bg-muted p-2 rounded">
            Статус API: {apiStatus}
            <Button size="sm" variant="outline" onClick={checkApiStatus} className="ml-2 bg-transparent">
              Обновить
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Создание напоминания */}
          <Card>
            <CardHeader>
              <CardTitle>Создать напоминание</CardTitle>
              <CardDescription>Добавьте новое напоминание с настройкой уровня паранойи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="text">Текст напоминания</Label>
                <Textarea
                  id="text"
                  placeholder="Что нужно напомнить?"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="time">Время</Label>
                <Input
                  id="time"
                  type="datetime-local"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="paranoia">Уровень паранойи: {newReminder.paranoia}</Label>
                <Select
                  value={newReminder.paranoia.toString()}
                  onValueChange={(value) => setNewReminder({ ...newReminder, paranoia: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Спокойно</SelectItem>
                    <SelectItem value="1">1 - Мягко</SelectItem>
                    <SelectItem value="2">2 - Обычно</SelectItem>
                    <SelectItem value="3">3 - Настойчиво</SelectItem>
                    <SelectItem value="4">4 - Агрессивно</SelectItem>
                    <SelectItem value="5">5 - ПАНИКА</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="geozone">Геозона (опционально)</Label>
                <Input
                  id="geozone"
                  placeholder="@Красная площадь +200м"
                  value={newReminder.geozone}
                  onChange={(e) => setNewReminder({ ...newReminder, geozone: e.target.value })}
                />
              </div>

              <Button onClick={handleCreateReminder} className="w-full">
                Создать напоминание
              </Button>
            </CardContent>
          </Card>

          {/* Активные напоминания */}
          <Card>
            <CardHeader>
              <CardTitle>Активные напоминания</CardTitle>
              <CardDescription>Список ваших текущих напоминаний</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{reminder.text}</p>
                      <Badge className={`${getParanoiaColor(reminder.paranoia)} text-white`}>{reminder.paranoia}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reminder.time}</p>
                    <p className="text-xs text-muted-foreground">Режим: {getParanoiaLabel(reminder.paranoia)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{reminders.length}</div>
              <div className="text-sm text-muted-foreground">Активных напоминаний</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">0</div>
              <div className="text-sm text-muted-foreground">Выполнено сегодня</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {Math.round(reminders.reduce((acc, r) => acc + r.paranoia, 0) / reminders.length) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Средний уровень паранойи</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">24/7</div>
              <div className="text-sm text-muted-foreground">Мониторинг</div>
            </CardContent>
          </Card>
        </div>

        {/* Инструкции */}
        <Card>
          <CardHeader>
            <CardTitle>Как использовать бота</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Команды бота:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• /start - Запуск бота</li>
                  <li>• /help - Справка</li>
                  <li>• /settings - Настройки</li>
                  <li>• /done - Отметить выполненным</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Примеры напоминаний:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "Напомни завтра в 15:00 купить молоко"</li>
                  <li>• "Через 2 часа позвонить маме"</li>
                  <li>• "Каждый понедельник в 9:00 планерка"</li>
                  <li>• "При входе @Офис включить рабочий режим"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
