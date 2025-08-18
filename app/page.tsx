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
            sendNotification(reminder)
            return { ...reminder, status: "overdue" as const }
          }
          return reminder
        }),
      )
    }

    const interval = setInterval(checkReminders, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Уведомления включены!", {
            body: "Теперь вы будете получать напоминания",
            icon: "/favicon.ico",
          })
        }
      })
    }
  }, [])

  const sendNotification = (reminder: Reminder) => {
    console.log("[v0] Sending notification for reminder:", reminder.text)

    // Play sound based on paranoia level
    playNotificationSound(reminder.paranoia)

    if ("Notification" in window && Notification.permission === "granted") {
      const title = getParanoiaTitle(reminder.paranoia)
      const options = {
        body: reminder.text,
        icon: "/favicon.ico",
        tag: `reminder-${reminder.id}`,
        requireInteraction: reminder.paranoia >= 3,
        silent: false,
      }

      const notification = new Notification(title, options)

      // Auto-close notification for low paranoia levels
      if (reminder.paranoia <= 2) {
        setTimeout(() => notification.close(), 5000)
      }

      // Multiple notifications for high paranoia levels
      if (reminder.paranoia >= 3) {
        setTimeout(() => {
          new Notification(`ПОВТОРНО: ${title}`, { ...options, tag: `reminder-${reminder.id}-2` })
          playNotificationSound(reminder.paranoia)
        }, 30000) // 30 seconds later
      }

      if (reminder.paranoia >= 4) {
        setTimeout(() => {
          new Notification(`СРОЧНО: ${title}`, { ...options, tag: `reminder-${reminder.id}-3` })
          playNotificationSound(reminder.paranoia)
        }, 60000) // 1 minute later
      }

      if (reminder.paranoia === 5) {
        // Extreme paranoia - multiple notifications
        const intervals = [90000, 120000, 180000] // 1.5, 2, 3 minutes
        intervals.forEach((delay, index) => {
          setTimeout(() => {
            new Notification(`🚨 КРИТИЧНО #${index + 4}: ${title}`, {
              ...options,
              tag: `reminder-${reminder.id}-${index + 4}`,
              requireInteraction: true,
            })
            playNotificationSound(5)
          }, delay)
        })
      }
    } else {
      // Fallback: browser alert if notifications not supported
      alert(`${getParanoiaTitle(reminder.paranoia)}: ${reminder.text}`)
    }
  }

  const playNotificationSound = (paranoiaLevel: number) => {
    try {
      // Create audio context for sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Different frequencies for different paranoia levels
      const frequencies = [440, 523, 659, 784, 880, 1047] // Musical notes
      const frequency = frequencies[paranoiaLevel] || 440

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = paranoiaLevel >= 4 ? "sawtooth" : "sine"

      // Volume and duration based on paranoia level
      const volume = Math.min(0.1 + paranoiaLevel * 0.1, 0.5)
      const duration = paranoiaLevel >= 3 ? 1000 : 500

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)

      // Multiple beeps for high paranoia
      if (paranoiaLevel >= 4) {
        setTimeout(() => playNotificationSound(paranoiaLevel), 200)
        if (paranoiaLevel === 5) {
          setTimeout(() => playNotificationSound(paranoiaLevel), 400)
        }
      }
    } catch (error) {
      console.log("[v0] Audio not supported:", error)
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
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission()
      }

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

      console.log("[v0] Created reminder:", reminder)
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
