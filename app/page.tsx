"use client"

import { useState, useEffect } from "react"

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

    const interval = setInterval(checkReminders, 10000)
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

      if (reminder.paranoia <= 2) {
        setTimeout(() => notification.close(), 5000)
      }

      if (reminder.paranoia >= 3) {
        setTimeout(() => {
          new Notification(`ПОВТОРНО: ${title}`, { ...options, tag: `reminder-${reminder.id}-2` })
          playNotificationSound(reminder.paranoia)
        }, 30000)
      }

      if (reminder.paranoia >= 4) {
        setTimeout(() => {
          new Notification(`СРОЧНО: ${title}`, { ...options, tag: `reminder-${reminder.id}-3` })
          playNotificationSound(reminder.paranoia)
        }, 60000)
      }

      if (reminder.paranoia === 5) {
        const intervals = [90000, 120000, 180000]
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
      alert(`${getParanoiaTitle(reminder.paranoia)}: ${reminder.text}`)
    }
  }

  const playNotificationSound = (paranoiaLevel: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const frequencies = [440, 523, 659, 784, 880, 1047]
      const frequency = frequencies[paranoiaLevel] || 440

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = paranoiaLevel >= 4 ? "sawtooth" : "sine"

      const volume = Math.min(0.1 + paranoiaLevel * 0.1, 0.5)
      const duration = paranoiaLevel >= 3 ? 1000 : 500

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)

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

  const activeReminders = reminders.filter((r) => r.status === "active")
  const overdueReminders = reminders.filter((r) => r.status === "overdue")
  const completedToday = reminders.filter(
    (r) => r.status === "completed" && new Date(r.createdAt).toDateString() === new Date().toDateString(),
  ).length

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Paranoia Reminder</h1>
          <p className="text-gray-400">Веб-система напоминаний с регулируемым режимом паранойи 0-5</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Создание напоминания */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Создать напоминание</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Текст напоминания</label>
                <textarea
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white"
                  placeholder="Что нужно напомнить?"
                  value={newReminder.text}
                  onChange={(e) => setNewReminder({ ...newReminder, text: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Время</label>
                <input
                  type="datetime-local"
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Уровень паранойи: {newReminder.paranoia}</label>
                <select
                  className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 text-white"
                  value={newReminder.paranoia}
                  onChange={(e) => setNewReminder({ ...newReminder, paranoia: Number.parseInt(e.target.value) })}
                >
                  <option value={0}>0 - Спокойно</option>
                  <option value={1}>1 - Мягко</option>
                  <option value={2}>2 - Обычно</option>
                  <option value={3}>3 - Настойчиво</option>
                  <option value={4}>4 - Агрессивно</option>
                  <option value={5}>5 - ПАНИКА</option>
                </select>
              </div>

              <button
                onClick={handleCreateReminder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Создать напоминание
              </button>
            </div>
          </div>

          {/* Активные напоминания */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Напоминания</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...overdueReminders, ...activeReminders].map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-3 border rounded-lg space-y-2 ${
                    reminder.status === "overdue" ? "border-red-500 bg-red-900/20" : "border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          reminder.status === "completed"
                            ? "bg-green-500"
                            : reminder.status === "overdue"
                              ? "bg-red-500"
                              : "bg-blue-500"
                        }`}
                      ></span>
                      <p className="font-medium">{reminder.text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs text-white ${getParanoiaColor(reminder.paranoia)}`}>
                        {reminder.paranoia}
                      </span>
                      <button
                        onClick={() => handleCompleteReminder(reminder.id)}
                        disabled={reminder.status === "completed"}
                        className="text-green-500 hover:text-green-400 disabled:opacity-50"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{new Date(reminder.time).toLocaleString("ru-RU")}</p>
                  <p className="text-xs text-gray-500">Режим: {getParanoiaLabel(reminder.paranoia)}</p>
                </div>
              ))}
              {reminders.length === 0 && (
                <p className="text-center text-gray-400 py-8">Напоминаний пока нет. Создайте первое!</p>
              )}
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{activeReminders.length}</div>
            <div className="text-sm text-gray-400">Активных</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{overdueReminders.length}</div>
            <div className="text-sm text-gray-400">Просрочено</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{completedToday}</div>
            <div className="text-sm text-gray-400">Выполнено сегодня</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {reminders.length > 0
                ? Math.round(reminders.reduce((acc, r) => acc + r.paranoia, 0) / reminders.length)
                : 0}
            </div>
            <div className="text-sm text-gray-400">Средняя паранойя</div>
          </div>
        </div>
      </div>
    </div>
  )
}
