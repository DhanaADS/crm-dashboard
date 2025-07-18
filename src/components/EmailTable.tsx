'use client'

import { useEffect, useState, useRef } from 'react'

type EmailItem = {
  id: string
  subject: string
  snippet: string
  from: string
  date: string | null
  body: string | null
}

type EmailTableProps = {
  emails?: EmailItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  onRefresh?: () => void
}

export default function EmailTable({ emails = [], status, onRefresh }: EmailTableProps) {
  const [view, setView] = useState<'summary' | 'message'>('summary')
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const summariesRef = useRef(summaries)

  // Keep ref in sync to avoid stale closure
  useEffect(() => {
    summariesRef.current = summaries
  }, [summaries])

  // Auto refresh inbox every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Auto Refresh] Fetching inbox...')
      onRefresh?.()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [onRefresh])

  // Fetch summaries when view is 'summary'
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
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="w-full max-w-6xl px-4">
        <div className="rounded shadow border border-gray-800 bg-[#121212] overflow-x-auto">
          <table className="w-full min-w-[900px] table-fixed text-sm">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="p-2 text-left font-semibold w-[110px]">Folders</th>
                <th className="p-2 text-left font-semibold w-[50px]">✔</th>
                <th className="p-2 text-left font-semibold w-[160px]">Name</th>
                <th className="p-2 text-left font-semibold w-[240px]">Subject</th>
                <th className="p-2 text-left font-semibold w-[340px]">
                  <div className="flex items-center gap-2">
                    <span>Switch</span>
                    <select
                      className="bg-gray-700 text-white rounded px-2 py-1 text-sm"
                      value={view}
                      onChange={(e) => setView(e.target.value as 'summary' | 'message')}
                    >
                      <option value="summary">AI Summary</option>
                      <option value="message">Message</option>
                    </select>
                  </div>
                </th>
                <th className="p-2 text-left font-semibold w-[160px]">Date & Time</th>
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
                  <td colSpan={6} className="text-center p-4 text-red-500">❌ Error loading inbox</td>
                </tr>
              )}
              {status === 'success' && emails.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-400">📭 No emails found</td>
                </tr>
              )}
              {status === 'success' && emails.map((email, idx) => (
                <tr key={email.id} className="border-t border-gray-700 hover:bg-gray-800 transition">
                  {idx === 0 && (
                    <td rowSpan={emails.length} className="align-top p-3 text-sm text-white bg-black border-r border-gray-700 w-[110px]">
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
                  <td className="p-2">
                    <input type="checkbox" className="form-checkbox text-blue-500" />
                  </td>
                  <td className="p-2 truncate">{email.from?.split('<')[0].trim() || 'Unknown'}</td>
                  <td className="p-2 font-medium truncate">{email.subject || '(No Subject)'}</td>
                  <td className="p-2 text-gray-300 truncate">
                    {view === 'summary'
                      ? summaries[email.id] || '⏳ Summarizing...'
                      : email.body || '(No body)'}
                  </td>
                  <td className="p-2 text-xs text-gray-400 whitespace-nowrap">
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