"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface Reminder {
  id: number
  text: string
  time: string
  paranoia: number
  status: "active" | "completed" | "overdue"
  createdAt: string
}

export default function WebReminderApp() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newReminder, setNewReminder] = useState({
    text: "",
    time: "",
    paranoia: 2,
  })

  useEffect(() => {
    const savedReminders = localStorage.getItem("paranoia-reminders")
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("paranoia-reminders", JSON.stringify(reminders))
  }, [reminders])

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      setReminders((prev) =>
        prev.map((reminder) => {
          const reminderTime = new Date(reminder.time)
          if (reminderTime <= now && reminder.status === "active") {
            // Send browser notification based on paranoia level
            sendNotification(reminder)
            return { ...reminder, status: "overdue" as const }
          }
          return reminder
        }),
      )
    }

    const interval = setInterval(checkReminders, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const sendNotification = (reminder: Reminder) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const title = getParanoiaTitle(reminder.paranoia)
      const options = {
        body: reminder.text,
        icon: "/favicon.ico",
        tag: `reminder-${reminder.id}`,
        requireInteraction: reminder.paranoia >= 4,
      }

      new Notification(title, options)

      // For high paranoia levels, show multiple notifications
      if (reminder.paranoia >= 4) {
        setTimeout(() => new Notification(`ПОВТОРНО: ${title}`, options), 5000)
      }
      if (reminder.paranoia === 5) {
        setTimeout(() => new Notification(`КРИТИЧНО: ${title}`, options), 10000)
      }
    }
  }

  const getParanoiaTitle = (level: number) => {
    const titles = [
      "Напоминание",
      "Мягкое напоминание",
      "Напоминание",
      "ВАЖНОЕ напоминание",
      "СРОЧНОЕ напоминание",
      "🚨 КРИТИЧЕСКОЕ НАПОМИНАНИЕ 🚨",
    ]
    return titles[level] || "Напоминание"
  }

  const handleCreateReminder = () => {
    if (newReminder.text && newReminder.time) {
      const reminder: Reminder = {
        id: Date.now(),
        text: newReminder.text,
        time: newReminder.time,
        paranoia: newReminder.paranoia,
        status: "active",
        createdAt: new Date().toISOString(),
      }
      setReminders([...reminders, reminder])
      setNewReminder({ text: "", time: "", paranoia: 2 })
    }
  }

  const handleCompleteReminder = (id: number) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: "completed" as const } : r)))
  }

  const handleDeleteReminder = (id: number) => {
    setReminders((prev) => prev.filter((r) => r.id !== id))
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  const activeReminders = reminders.filter((r) => r.status === "active")
  const overdueReminders = reminders.filter((r) => r.status === "overdue")
  const completedToday = reminders.filter(
    (r) => r.status === "completed" && new Date(r.createdAt).toDateString() === new Date().toDateString(),
  ).length

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Paranoia Reminder</h1>
          <p className="text-muted-foreground">Веб-система напоминаний с регулируемым режимом паранойи 0-5</p>
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

              <Button onClick={handleCreateReminder} className="w-full">
                Создать напоминание
              </Button>
            </CardContent>
          </Card>

          {/* Активные напоминания */}
          <Card>
            <CardHeader>
              <CardTitle>Напоминания</CardTitle>
              <CardDescription>Ваши активные и просроченные напоминания</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...overdueReminders, ...activeReminders].map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3 border rounded-lg space-y-2 ${
                      reminder.status === "overdue" ? "border-red-500 bg-red-50 dark:bg-red-950" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(reminder.status)}
                        <p className="font-medium">{reminder.text}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getParanoiaColor(reminder.paranoia)} text-white`}>
                          {reminder.paranoia}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCompleteReminder(reminder.id)}
                          disabled={reminder.status === "completed"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteReminder(reminder.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{new Date(reminder.time).toLocaleString("ru-RU")}</p>
                    <p className="text-xs text-muted-foreground">Режим: {getParanoiaLabel(reminder.paranoia)}</p>
                  </div>
                ))}
                {reminders.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Напоминаний пока нет. Создайте первое!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{activeReminders.length}</div>
              <div className="text-sm text-muted-foreground">Активных</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{overdueReminders.length}</div>
              <div className="text-sm text-muted-foreground">Просрочено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{completedToday}</div>
              <div className="text-sm text-muted-foreground">Выполнено сегодня</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {reminders.length > 0
                  ? Math.round(reminders.reduce((acc, r) => acc + r.paranoia, 0) / reminders.length)
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Средняя паранойя</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
