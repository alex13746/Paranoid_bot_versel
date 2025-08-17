export interface User {
  id: string
  telegramId: number
  username?: string
  firstName?: string
  lastName?: string
  paranoiaLevel: number
  quietHours?: {
    start: string
    end: string
  }
  backupContacts: string[]
  templates: Template[]
  createdAt: Date
  updatedAt: Date
}

export interface Reminder {
  id: string
  userId: string
  text: string
  scheduledFor: Date
  paranoiaLevel: number
  status: "pending" | "active" | "completed" | "snoozed" | "cancelled"
  geozone?: Geozone
  recurrence?: RecurrenceRule
  escalationCount: number
  lastEscalation?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Geozone {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  triggerType: "enter" | "exit"
}

export interface RecurrenceRule {
  type: "daily" | "weekly" | "monthly"
  interval: number
  daysOfWeek?: number[]
  endDate?: Date
}

export interface Template {
  id: string
  alias: string
  text: string
  paranoiaLevel: number
  geozone?: string
}

export interface EscalationLevel {
  level: number
  intervals: number[]
  methods: ("telegram" | "sms" | "call")[]
  backupContact: boolean
}

export interface ParsedTime {
  datetime: Date | null
  recurrence: RecurrenceRule | null
  confidence: number
  originalText: string
}

export interface ParsedGeozone {
  name: string
  radius: number
  triggerType: "enter" | "exit"
  confidence: number
}
