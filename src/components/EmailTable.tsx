'use client'
import { useState, useEffect, useRef } from 'react'
import { EmailItem } from '@/types/email'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import styles from './EmailTable.module.css'

type EmailTableProps = {
  emails?: EmailItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  onRefresh?: () => void
}

interface AISummary {
  id: string
  summary: string
}

export default function EmailTable({ emails = [], status, onRefresh }: EmailTableProps) {
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null)
  const [activeFolder, setActiveFolder] = useState<string>('inbox')
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({})
  const [loadingAI, setLoadingAI] = useState(false)
  const [theme, setTheme] = useState('dark')
  const summariesRef = useRef(aiSummaries)

  // Theme detection
  useEffect(() => {
    const savedTheme = localStorage.getItem('ads-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
    
    const checkTheme = () => {
      const htmlElement = document.documentElement
      const currentTheme = htmlElement.className || 'dark'
      setTheme(currentTheme)
    }
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  // Keep summariesRef in sync
  useEffect(() => {
    summariesRef.current = aiSummaries
  }, [aiSummaries])

  // Auto-refresh emails every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Auto Refresh] Fetching inbox...')
      onRefresh?.()
    }, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [onRefresh])

  // Auto-select first email when emails load
  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0])
    }
  }, [emails, selectedEmail])

  // Generate AI Summary using your existing API
  const generateAISummary = async (email: EmailItem): Promise<string> => {
    try {
      if (!email.body) {
        console.log(`⚠️ No body content for email ${email.id}`)
        return '📧 No content to summarize'
      }

      console.log(`🚀 Calling /api/summary for email ${email.id}`)
      
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emailId: email.id, 
          message: email.body 
        })
      })

      console.log(`📡 API response status:`, res.status)
      
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const data = await res.json()
      console.log(`📊 API response data:`, data)

      if (data.summary) {
        console.log(`✅ Summary received for ${email.id}:`, data.summary)
        return data.summary
      } else {
        console.log(`⚠️ No summary in response for ${email.id}`)
        return '⚠️ No summary returned'
      }
    } catch (error) {
      console.error('❌ Error generating AI summary:', error)
      return '⚠️ Error summarizing - Check console for details'
    }
  }

  // Generate AI summaries for all emails using your API
  const generateAllAISummaries = async () => {
    if (emails.length === 0) return
    
    setLoadingAI(true)
    console.log('🤖 Starting AI summary generation for', emails.length, 'emails')
    
    try {
      const newSummaries = { ...summariesRef.current }
      
      for (const email of emails) {
        // Skip if already have summary
        if (newSummaries[email.id]) {
          console.log(`✅ Skipping email ${email.id} - already has summary`)
          continue
        }
        
        console.log(`🔄 Generating summary for email: ${email.id}`)
        console.log(`📧 Email content preview:`, email.body?.substring(0, 100))
        
        const summary = await generateAISummary(email)
        newSummaries[email.id] = summary
        
        console.log(`✅ Generated summary for ${email.id}:`, summary)
        
        // Update state incrementally so user sees progress
        setAiSummaries(prev => {
          const updated = { ...prev, [email.id]: summary }
          console.log('📊 Updated summaries state:', updated)
          return updated
        })
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      console.log('🎉 All summaries generated successfully')
      
    } catch (error) {
      console.error('❌ Error generating AI summaries:', error)
    } finally {
      setLoadingAI(false)
    }
  }

  // Auto-generate summaries when AI Summary folder is active
  useEffect(() => {
    if (activeFolder === 'ai-summary' && emails.length > 0) {
      const needsSummaries = emails.some(email => !summariesRef.current[email.id])
      if (needsSummaries) {
        generateAllAISummaries()
      }
    }
  }, [activeFolder, emails])

  // Handle folder click
  const handleFolderClick = (folder: string) => {
    setActiveFolder(folder)
    if (folder === 'ai-summary') {
      generateAllAISummaries()
    }
  }

  // Get current content based on active folder
  const getCurrentContent = () => {
    if (activeFolder === 'ai-summary') {
      return renderAISummary()
    }
    return renderEmailList()
  }

  const renderAISummary = () => (
    <div className={styles.aiSummaryContainer}>
      <div className={styles.aiHeader}>
        <div className={styles.aiTitle}>
          <span className={styles.aiIcon}>🤖</span>
          AI Email Summary
        </div>
        <Button
          onClick={generateAllAISummaries}
          size="sm"
          disabled={loadingAI}
          className={styles.aiRefreshBtn}
        >
          {loadingAI ? '🔄 Analyzing...' : '✨ Regenerate'}
        </Button>
      </div>
      
      {loadingAI ? (
        <div className={styles.aiLoading}>
          <div className={styles.aiLoadingIcon}>🧠</div>
          <div className={styles.aiLoadingText}>AI is analyzing your emails...</div>
          <div className={styles.aiLoadingSubtext}>This may take a few moments</div>
        </div>
      ) : (
        <div className={styles.aiSummaryList}>
          {emails.length === 0 ? (
            <div className={styles.aiEmpty}>
              <div className={styles.aiEmptyIcon}>🤖</div>
              <div className={styles.aiEmptyText}>No emails to summarize</div>
              <div className={styles.aiEmptySubtext}>Load some emails first</div>
            </div>
          ) : (
            emails.map((email) => {
              const summary = aiSummaries[email.id]
              
              return (
                <div
                  key={email.id}
                  className={styles.aiSummaryItem}
                  onClick={() => {
                    setSelectedEmail(email)
                    setActiveFolder('inbox')
                  }}
                >
                  <div className={styles.aiSummaryHeader}>
                    <div className={styles.aiSummaryFrom}>
                      {email.from?.split('<')[0].trim() || 'Unknown'}
                    </div>
                    <div className={styles.aiSummaryDate}>
                      {email.date ? new Date(email.date).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <div className={styles.aiSummaryText}>
                    {summary || '⏳ Generating summary...'}
                  </div>
                  <div className={styles.aiSummarySubject}>
                    Subject: {email.subject || 'No subject'}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )

  const renderEmailList = () => (
    <>
      {status === 'loading' && (
        <div className={styles.loadingState}>
          <div className={styles.loadingIcon}>⏳</div>
          <div className={styles.loadingText}>Loading emails...</div>
        </div>
      )}
      {status === 'success' && emails.map((email) => (
        <div
          key={email.id}
          onClick={() => setSelectedEmail(email)}
          className={`${styles.emailItem} ${selectedEmail?.id === email.id ? styles.emailItemSelected : ''}`}
        >
          <div className={styles.emailAvatar}>
            {email.from?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className={styles.emailContent}>
            <div className={styles.emailHeader}>
              <span className={styles.emailFrom}>
                {email.from?.split('<')[0].trim() || 'Unknown'}
              </span>
              <span className={styles.emailDate}>
                {email.date ? new Date(email.date).toLocaleDateString() : ''}
              </span>
            </div>
            <div className={styles.emailSubject}>
              {email.subject || '(No Subject)'}
            </div>
            <div className={styles.emailPreview}>
              {email.body ? email.body.substring(0, 120) + '...' : '(No content)'}
            </div>
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.containerDark : styles.containerLight}`}>
      {/* Animated Background */}
      <div className={styles.backgroundPattern}></div>
      <div className={styles.floatingElements}>
        <div className={`${styles.floatingElement} ${styles.element1}`}></div>
        <div className={`${styles.floatingElement} ${styles.element2}`}></div>
        <div className={`${styles.floatingElement} ${styles.element3}`}></div>
      </div>

      <div className={styles.gridLayout}>
        {/* FOLDERS SIDEBAR */}
        <Card className={`${styles.card} ${styles.foldersCard}`}>
          <CardHeader className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              📁 Folders
            </h3>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <div className={styles.foldersList}>
              {/* AI Summary Folder */}
              <div 
                className={`${styles.folderItem} ${activeFolder === 'ai-summary' ? styles.folderActive : ''}`}
                onClick={() => handleFolderClick('ai-summary')}
              >
                <span className={styles.folderIcon}>🤖</span>
                <span className={styles.folderName}>AI Summary</span>
                {loadingAI && <span className={styles.folderSpinner}>⏳</span>}
              </div>

              {/* Inbox Folder */}
              <div 
                className={`${styles.folderItem} ${activeFolder === 'inbox' ? styles.folderActive : ''}`}
                onClick={() => handleFolderClick('inbox')}
              >
                <span className={styles.folderIcon}>📥</span>
                <span className={styles.folderName}>Inbox</span>
                <span className={styles.folderCount}>{emails.length}</span>
              </div>

              {/* Other Folders */}
              <div className={styles.folderItem}>
                <span className={styles.folderIcon}>📝</span>
                <span className={styles.folderName}>Drafts</span>
                <span className={styles.folderCount}>9</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EMAIL LIST */}
        <Card className={`${styles.card} ${styles.emailListCard}`}>
          <CardHeader className={styles.cardHeader}>
            <div className={styles.emailListHeader}>
              <h3 className={styles.cardTitle}>
                {activeFolder === 'ai-summary' ? '🤖 AI Summary' : '📬 Email List'}
              </h3>
              <div className={styles.emailListActions}>
                <Button
                  onClick={onRefresh}
                  size="sm"
                  variant="outline"
                  className={styles.actionButton}
                >
                  🔄 Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.actionButton}
                >
                  All mail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={styles.actionButton}
                >
                  Unread
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`${styles.cardContent} ${styles.emailListContent}`}>
            {getCurrentContent()}
          </CardContent>
        </Card>

        {/* EMAIL DETAIL */}
        <Card className={`${styles.card} ${styles.emailDetailCard}`}>
          <CardHeader className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              📖 Email Detail
            </h3>
          </CardHeader>
          <CardContent className={`${styles.cardContent} ${styles.emailDetailContent}`}>
            {selectedEmail ? (
              <div className={styles.emailDetail}>
                <div className={styles.emailDetailHeader}>
                  <div className={styles.emailDetailAvatar}>
                    {selectedEmail.from?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className={styles.emailDetailInfo}>
                    <div className={styles.emailDetailFrom}>
                      {selectedEmail.from?.split('<')[0].trim() || 'Unknown'}
                    </div>
                    <div className={styles.emailDetailDate}>
                      {selectedEmail.date ? new Date(selectedEmail.date).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
                <h2 className={styles.emailDetailSubject}>
                  {selectedEmail.subject || '(No Subject)'}
                </h2>
                <div className={styles.emailDetailBody}>
                  {selectedEmail.body || '(No content available)'}
                </div>
              </div>
            ) : (
              <div className={styles.emailDetailEmpty}>
                <div className={styles.emailDetailEmptyIcon}>✉️</div>
                <div className={styles.emailDetailEmptyTitle}>Select an email to read</div>
                <div className={styles.emailDetailEmptyText}>Click on any email in the list</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}