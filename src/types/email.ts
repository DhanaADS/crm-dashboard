// src/types/email.ts

export type EmailItem = {
  id: string
  subject: string
  snippet: string
  from: string
  date: string | null
  body: string | null
}