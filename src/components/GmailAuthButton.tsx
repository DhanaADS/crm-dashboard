'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function GmailAuthButton() {
  const { data: session } = useSession()

  return (
    <div className="text-white p-4 bg-zinc-800 rounded-md shadow-md w-fit">
      {!session ? (
        <button
          onClick={() =>
            signIn('google', {
              callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
              prompt: 'select_account'
            })
          }
          className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
        >
          📩 Connect Gmail
        </button>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          <p className="text-sm">✅ Connected as: {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-600 px-3 py-1 text-sm rounded hover:bg-red-700"
          >
            🔌 Disconnect
          </button>
        </div>
      )}
    </div>
  )
}