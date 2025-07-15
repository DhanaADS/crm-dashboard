'use client'

import React from 'react'

export default function TabSwitcher() {
  return (
    <div className="flex flex-row space-x-4 mt-4">
      <button className="bg-gray-800 hover:bg-[#D93025] hover:scale-105 transform transition-all ease-in-out duration-200 text-white px-6 py-2 rounded shadow">
        Gmail
      </button>
      <button className="bg-gray-800 hover:bg-[#25D366] hover:scale-105 transform transition-all ease-in-out duration-200 text-white px-6 py-2 rounded shadow">
        WhatsApp
      </button>
      <button className="bg-gray-800 hover:bg-[#0088cc] hover:scale-105 transform transition-all ease-in-out duration-200 text-white px-6 py-2 rounded shadow">
        Telegram
      </button>
    </div>
  )
}