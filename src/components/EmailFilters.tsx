'use client'

import React from 'react'

type EmailFiltersProps = {
  source: 'Gmail' | 'WhatsApp' | 'Telegram'
}

export default function EmailFilters({ source }: EmailFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto">
      <div className="text-sm">
        Showing messages for: <strong>{source}</strong>
      </div>
      {source === 'Gmail' && (
        <div>
          <select
            id="email-filter"
            name="email-filter"
            aria-label="Gmail filter"
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
          >
            <option>All Filters</option>
            <option>Name</option>
            <option>ID</option>
            <option>Subject</option>
            <option>Body</option>
            <option>Date</option>
          </select>
        </div>
      )}
    </div>
  )
}