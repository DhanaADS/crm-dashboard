'use client'

import { useRouter } from 'next/navigation'

export default function NewOrderPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              New Order
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Order creation feature coming soon!
            </p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}