'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Shield, Sparkles, Chrome, Sun, Moon } from 'lucide-react'

const allowedAdmins = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function LoginPage() {
  const [theme, setTheme] = useState('dark')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('ads-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        setIsLoading(true)
        const userEmail = session.user.email
        
        if (allowedAdmins.includes(userEmail)) {
          setMessage('Access granted! Redirecting to dashboard...')
          setMessageType('success')
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else {
          setMessage('Access denied: You are not an authorized admin.')
          setMessageType('error')
          await supabase.auth.signOut()
          setIsLoading(false)
        }
      }
      
      if (event === 'SIGNED_OUT') {
        setIsLoading(false)
        setMessage('')
        setMessageType('')
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [supabase, router])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('ads-theme', newTheme)
    document.documentElement.className = newTheme
  }

  return (
    <div className={`login-container ${theme === 'dark' ? 'login-container-dark' : 'login-container-light'}`}>
      
      {/* Animated Background */}
      <div className="background-elements">
        <div className="grid-overlay"></div>
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        style={{
          background: theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)',
          color: theme === 'dark' ? '#ffffff' : '#000000'
        }}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Main Login Card */}
      <div className={`login-card ${theme === 'dark' ? 'login-card-dark' : 'login-card-light'}`}>
        
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-container">
            <div className="logo-wrapper">
              <Image
                src="/assets/ads-logo.png"
                alt="ADS Logo"
                width={40}
                height={40}
                className="logo-image"
              />
            </div>
          </div>
          
          <h1 className="logo-title">ADS Dashboard</h1>
          <p className={`logo-subtitle ${theme === 'dark' ? 'logo-subtitle-dark' : 'logo-subtitle-light'}`}>
            Advanced Management System
          </p>
        </div>

        {/* Header Section */}
        <div className="header-section">
          <h2 className={`welcome-text ${theme === 'dark' ? 'welcome-text-dark' : 'welcome-text-light'}`}>
            Welcome Back
          </h2>
          <p className={`description-text ${theme === 'dark' ? 'description-text-dark' : 'description-text-light'}`}>
            Sign in to access your premium dashboard with advanced analytics and management tools.
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message-container ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
            <div className="flex items-center gap-2">
              {messageType === 'success' ? (
                <Shield className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Auth Container */}
        <div className="auth-container">
          {/* Supabase Auth */}
          <Auth
            supabaseClient={supabase}
            view="magic_link"
            appearance={{
              theme: ThemeSupa,
              className: {
                container: 'auth-container-custom',
                button: 'auth-button-custom',
                input: `auth-input-custom ${theme === 'dark' ? 'auth-input-dark' : 'auth-input-light'}`,
                label: `auth-label-custom ${theme === 'dark' ? 'auth-label-dark' : 'auth-label-light'}`,
                message: 'auth-message-custom',
              },
            }}
            theme={theme}
            providers={['google']}
            showLinks={false}
            magicLink={true}
            localization={{
              variables: {
                magic_link: {
                  email_input_label: 'Email Address',
                  button_label: 'Send Magic Link',
                  link_text: '',
                  confirmation_text: 'Check your email for the login link!',
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className={`footer-section ${theme === 'dark' ? 'footer-section-dark' : 'footer-section-light'}`}>
          <p className={`footer-text ${theme === 'dark' ? 'footer-text-dark' : 'footer-text-light'}`}>
            Use your <span className="footer-highlight">authorized email</span> to receive a secure magic link.
            <br />
            Only approved administrators can access this dashboard.
          </p>
        </div>
      </div>

      {/* Embedded Styles */}
      <style jsx>{`
        /* Main Container */
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-container-dark {
          background: linear-gradient(135deg, #0c0a09 0%, #1c1917 20%, #44403c 40%, #1c1917 60%, #0c0a09 100%);
        }

        .login-container-light {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 20%, #cbd5e1 40%, #e2e8f0 60%, #f8fafc 100%);
        }

        /* Animated Background Elements */
        .background-elements {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          top: 10%;
          left: 10%;
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          animation-delay: 0s;
        }

        .orb-2 {
          top: 60%;
          right: 10%;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #ec4899, #f59e0b);
          animation-delay: 2s;
        }

        .orb-3 {
          bottom: 20%;
          left: 20%;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #10b981, #06b6d4);
          animation-delay: 4s;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
          opacity: 0.3;
        }

        /* Theme Toggle */
        .theme-toggle {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 20;
          padding: 0.75rem;
          border-radius: 50%;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          transform: scale(1.1);
        }

        /* Main Card */
        .login-card {
          position: relative;
          width: 100%;
          max-width: 28rem;
          padding: 3rem;
          border-radius: 2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          z-index: 10;
        }

        .login-card-dark {
          background: rgba(23, 23, 23, 0.6);
          border-color: rgba(82, 82, 91, 0.3);
        }

        .login-card-light {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(203, 213, 225, 0.5);
        }

        /* Glowing Border Effect */
        .login-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 2rem;
          padding: 2px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6);
          background-size: 300% 300%;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          animation: borderGlow 4s ease infinite;
          opacity: 0.6;
        }

        /* Logo Section */
        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .logo-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .logo-wrapper {
          width: 5rem;
          height: 5rem;
          border-radius: 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
          animation: logoFloat 3s ease-in-out infinite;
          position: relative;
        }

        .logo-wrapper::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 1.5rem;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
          background-size: 200% 200%;
          animation: logoGlow 3s ease infinite;
          z-index: -1;
          opacity: 0.5;
          filter: blur(8px);
        }

        .logo-image {
          object-fit: contain;
          filter: brightness(1.1);
        }

        .logo-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .logo-subtitle {
          font-size: 0.875rem;
          font-weight: 500;
          text-align: center;
          opacity: 0.8;
        }

        .logo-subtitle-dark {
          color: #a1a1aa;
        }

        .logo-subtitle-light {
          color: #64748b;
        }

        /* Header Text */
        .header-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .welcome-text {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .welcome-text-dark {
          background: linear-gradient(135deg, #f9fafb 0%, #d1d5db 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .welcome-text-light {
          color: #1f2937;
        }

        .description-text {
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.8;
        }

        .description-text-dark {
          color: #a1a1aa;
        }

        .description-text-light {
          color: #64748b;
        }

        /* Auth Container */
        .auth-container {
          margin-bottom: 2rem;
        }

        /* Custom Auth Styling */
        :global(.auth-container-custom) {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        :global(.auth-input-custom) {
          width: 100%;
          padding: 0.875rem 1rem;
          border-radius: 0.75rem;
          border: 2px solid;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: transparent;
          backdrop-filter: blur(10px);
        }

        :global(.auth-input-dark) {
          border-color: rgba(82, 82, 91, 0.5);
          background: rgba(39, 39, 42, 0.5);
          color: #f3f4f6;
        }

        :global(.auth-input-dark:focus) {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }

        :global(.auth-input-light) {
          border-color: rgba(203, 213, 225, 0.8);
          background: rgba(255, 255, 255, 0.8);
          color: #1f2937;
        }

        :global(.auth-input-light:focus) {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }

        :global(.auth-input-custom::placeholder) {
          opacity: 0.6;
        }

        :global(.auth-label-custom) {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        :global(.auth-label-dark) {
          color: #f3f4f6;
        }

        :global(.auth-label-light) {
          color: #374151;
        }

        :global(.auth-button-custom) {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          border: none;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          color: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        :global(.auth-button-custom:hover) {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        }

        :global(.auth-button-custom:active) {
          transform: translateY(0);
        }

        :global(.auth-button-custom::before) {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%, rgba(255, 255, 255, 0.2) 100%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }

        :global(.auth-button-custom:hover::before) {
          transform: translateX(100%);
        }

        :global(.auth-message-custom) {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.1);
          color: #059669;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Messages */
        .message-container {
          margin: 1rem 0;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid;
          backdrop-filter: blur(10px);
        }

        .success-message {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.1);
          color: #059669;
        }

        .error-message {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        }

        /* Footer */
        .footer-section {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid;
          margin-top: 1.5rem;
        }

        .footer-section-dark {
          border-color: rgba(82, 82, 91, 0.3);
        }

        .footer-section-light {
          border-color: rgba(203, 213, 225, 0.5);
        }

        .footer-text {
          font-size: 0.875rem;
          line-height: 1.5;
          opacity: 0.8;
        }

        .footer-text-dark {
          color: #a1a1aa;
        }

        .footer-text-light {
          color: #64748b;
        }

        .footer-highlight {
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes logoFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes logoGlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .login-card {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }
          
          .logo-wrapper {
            width: 4rem;
            height: 4rem;
          }
          
          .logo-title {
            font-size: 1.75rem;
          }
          
          .welcome-text {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 1.5rem 1rem;
          }
          
          .orb-1, .orb-2, .orb-3 {
            opacity: 0.05;
          }
        }
      `}</style>
    </div>
  )
}