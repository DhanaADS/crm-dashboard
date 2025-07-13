'use client'

import { useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push('/dashboard') // ✅ redirect after login
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="auth-ui w-full max-w-sm p-6 bg-zinc-900 rounded-xl shadow-md">
        <h1 className="text-xl font-semibold text-center mb-6">
          🔐 Login to ADS Dashboard
        </h1>

        <Auth
          supabaseClient={supabase}
          view="magic_link"
          appearance={{
  theme: ThemeSupa,
  className: {
    container: 'flex flex-col items-center gap-2',
    button: 'py-2 px-4 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md mx-auto',
    input: 'rounded bg-gray-800 border border-gray-700 text-white px-3 py-2',
    label: 'text-sm font-medium text-white',
  },
}}
          theme="dark"
          providers={['google']}
          showLinks={false}
          magicLink={true}
          localization={{
  variables: {
    magic_link: {
      email_input_label: 'Email address', // ✅ Correct key
      button_label: 'Send Magic Link',
      link_text: '',
      confirmation_text: 'Check your email for the login link!',
    }
  }
}}
        />

        <p className="mt-6 text-center text-sm text-gray-400">
          Use your <strong>authorized email</strong> to receive a magic link
        </p>
      </div>

      <style jsx global>{`
        .auth-ui form {
          max-width: 13rem !important;
          margin: 0 auto !important;
        }
      `}</style>
    </div>
  )
}