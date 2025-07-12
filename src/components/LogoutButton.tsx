'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LogoutButton() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // redirect to login
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded shadow"
    >
      🔓 Logout
    </button>
  )
}