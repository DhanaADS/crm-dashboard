'use client'

import { useEffect, useState, useRef } from 'react'
import { EmailItem } from '@/types/email'

type EmailTableProps = {
  emails?: EmailItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  onRefresh?: () => void
}

export default function EmailTable({ emails = [], status, onRefresh }: EmailTableProps) {
  const [view, setView] = useState<'summary' | 'message'>('summary')
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const summariesRef = useRef(summaries)

  useEffect(() => {
    summariesRef.current = summaries
  }, [summaries])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Auto Refresh] Fetching inbox...')
      onRefresh?.()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [onRefresh])

  useEffect(() => {
    const fetchSummaries = async () => {
      if (view !== 'summary') return

      for (const email of emails) {
        if (!summariesRef.current[email.id] && email.body) {
          try {
            const res = await fetch('/api/summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ emailId: email.id, message: email.body })
            })

            const data = await res.json()

            if (data.summary) {
              setSummaries(prev => ({ ...prev, [email.id]: data.summary }))
            } else {
              setSummaries(prev => ({ ...prev, [email.id]: '⚠️ No summary returned' }))
            }
          } catch (err) {
            console.error('Error summarizing:', err)
            setSummaries(prev => ({ ...prev, [email.id]: '⚠️ Error summarizing' }))
          }
        }
      }
    }

    fetchSummaries()
  }, [view, emails])

  const formatIST = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="w-full flex flex-col items-center py-10 gap-4">
      <div className="flex justify-between w-full max-w-6xl px-4">
        <div />
        <button onClick={onRefresh} className="btn btn-outline">
          🔄 Refresh
        </button>
      </div>

      <div className="w-full max-w-6xl px-4">
        <div className="card overflow-x-auto bg-transparent text-white">
          <table className="w-full min-w-[900px] table-fixed text-sm">
            <thead className="bg-black/30 text-white">
              <tr>
                <th className="table-cell w-[110px]">Folders</th>
                <th className="table-cell w-[50px]">✔</th>
                <th className="table-cell w-[160px]">Name</th>
                <th className="table-cell w-[240px]">Subject</th>
                <th className="table-cell w-[340px]">
                  <div className="flex items-center gap-2">
                    <span>Switch</span>
                    <select
                      className="select"
                      value={view}
                      onChange={(e) => setView(e.target.value as 'summary' | 'message')}
                    >
                      <option value="summary">AI Summary</option>
                      <option value="message">Message</option>
                    </select>
                  </div>
                </th>
                <th className="table-cell w-[160px]">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-yellow-400">🔄 Loading emails...</td>
                </tr>
              )}
              {status === 'error' && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-red-400">❌ Error loading inbox</td>
                </tr>
              )}
              {status === 'success' && emails.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-white/70">📭 No emails found</td>
                </tr>
              )}
              {status === 'success' && emails.map((email, idx) => (
                <tr
                  key={email.id}
                  className={`border-t border-white/10 transition-colors ${
                    idx % 2 === 0 ? 'bg-white/5' : 'bg-white/10'
                  } hover:bg-white/20`}
                >
                  {idx === 0 && (
                    <td
                      rowSpan={emails.length}
                      className="align-top p-3 bg-white/90 text-black border-r border-white/20 w-[110px] text-sm"
                    >
                      <div className="space-y-2">
                        <div className="font-semibold mb-2">📁 Folders</div>
                        <ul className="space-y-1">
                          <li className="hover:font-semibold cursor-pointer">📥 Inbox</li>
                          <li className="hover:font-semibold cursor-pointer">📤 Sent</li>
                          <li className="hover:font-semibold cursor-pointer">📝 Drafts</li>
                          <li className="hover:font-semibold cursor-pointer">⚠️ Spam</li>
                          <li className="hover:font-semibold cursor-pointer">🗑️ Trash</li>
                        </ul>
                      </div>
                    </td>
                  )}
                  <td className="table-cell text-white">
                    <input type="checkbox" className="form-checkbox text-primary" />
                  </td>
                  <td className="table-cell truncate text-white">{email.from?.split('<')[0].trim() || 'Unknown'}</td>
                  <td className="table-cell font-medium truncate text-white">{email.subject || '(No Subject)'}</td>
                  <td className="table-cell truncate text-white">
                    {view === 'summary'
                      ? summaries[email.id] || '⏳ Summarizing...'
                      : email.body || '(No body)'}
                  </td>
                  <td className="table-cell text-xs text-white whitespace-nowrap">
                    {formatIST(email.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}