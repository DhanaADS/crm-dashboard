'use client'

import { useState } from 'react'
import { format } from 'date-fns'

export default function CalendarWidget() {
  const [date] = useState(new Date())

  return (
    <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow text-center">
      <h3 className="text-sm font-medium">🗓️ {format(date, 'MMMM yyyy')}</h3>
      <p className="text-xs text-gray-300">{format(date, 'eeee, dd')}</p>
    </div>
  )
}