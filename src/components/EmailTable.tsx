'use client'
import { useState, useEffect } from 'react'
import { EmailItem } from '@/types/email'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type EmailTableProps = {
  emails?: EmailItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  onRefresh?: () => void
}

export default function EmailTable({ emails = [], status, onRefresh }: EmailTableProps) {
  console.log('🔥🔥🔥 ENHANCED THEMED EMAIL TABLE LOADED! 🔥🔥🔥');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null)

  // Simple theme detection
  const [isDark, setIsDark] = useState(true)
  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement
      const isDarkTheme = htmlElement.classList.contains('dark') || htmlElement.className === 'dark'
      setIsDark(isDarkTheme)
    }
    checkTheme()
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    return () => observer.disconnect()
  }, [])

  // Auto-select first email when emails load
  useEffect(() => {
    if (emails.length > 0 && !selectedEmail) {
      setSelectedEmail(emails[0])
    }
  }, [emails, selectedEmail])

  // FORCE OVERRIDE STYLES TO PREVENT CONFLICTS
  const containerStyle = {
    width: '100%',
    maxWidth: 'none',
    backgroundColor: 'transparent',
    padding: '0'
  }
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '280px 1fr 380px',
    gap: '16px',
    height: '520px',
    width: '100%'
  }

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {/* FOLDERS SIDEBAR */}
        <Card style={{
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.015)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.04)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader style={{
            paddingBottom: '12px',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              color: isDark ? '#ffffff' : '#1f2937',
              fontWeight: '600',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📁 Folders
            </h3>
          </CardHeader>
          <CardContent style={{ paddingTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* AI Summary */}
              <div style={{
                padding: '12px',
                color: isDark ? '#ffffff' : '#1f2937',
                borderRadius: '8px',
                cursor: 'default', // Make it non-interactive
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💡 AI Summary
                </span>
              </div>

              {/* ACTIVE INBOX */}
              <div style={{
                padding: '12px',
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                borderRadius: '8px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📥 Inbox
                </span>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '4px 8px',
                  borderRadius: '12px'
                }}>
                  {emails.length}
                </span>
              </div>

              {/* OTHER FOLDERS - Filtered to remove Sent, Junk, Trash */}
              {[
                { icon: '📝', name: 'Drafts', count: 9 }
                // { icon: '📤', name: 'Sent', count: 0 },  // Removed
                // { icon: '🚫', name: 'Junk', count: 23 },  // Removed
                // { icon: '🗑️', name: 'Trash', count: 0 }   // Removed
              ].map((folder) => (
                <div key={folder.name} style={{
                  padding: '12px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                  e.currentTarget.style.color = isDark ? '#ffffff' : '#1f2937'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {folder.icon} {folder.name}
                  </span>
                  {folder.count > 0 && (
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      padding: '2px 6px',
                      borderRadius: '12px'
                    }}>
                      {folder.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* EMAIL LIST */}
        <Card style={{
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.015)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.04)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader style={{
            paddingBottom: '12px',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{
                color: isDark ? '#ffffff' : '#1f2937',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📬 Email List
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  onClick={onRefresh}
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-sm button-inactive"
                >
                  🔄 Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-sm button-inactive"
                >
                  All mail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-sm button-inactive"
                >
                  Unread
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ paddingTop: '12px', height: '420px', overflowY: 'auto' }}>
            {status === 'loading' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '128px',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                  <div style={{ fontSize: '14px' }}>Loading emails...</div>
                </div>
              </div>
            )}
            {status === 'success' && emails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: selectedEmail?.id === email.id
                    ? '1px solid hsl(var(--primary))'
                    : '1px solid transparent',
                  backgroundColor: selectedEmail?.id === email.id
                    ? isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    : 'transparent',
                  marginBottom: '8px'
                }}
                onMouseOver={(e) => {
                  if (selectedEmail?.id !== email.id) {
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedEmail?.id !== email.id) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'hsl(var(--primary))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--primary-foreground))',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {email.from?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{
                        color: isDark ? '#ffffff' : '#1f2937',
                        fontSize: '14px',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {email.from?.split('<')[0].trim() || 'Unknown'}
                      </span>
                      <span style={{
                        color: isDark ? '#9ca3af' : '#6b7280',
                        fontSize: '12px',
                        flexShrink: 0,
                        marginLeft: '8px'
                      }}>
                        {email.date ? new Date(email.date).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div style={{
                      color: isDark ? '#ffffff' : '#1f2937',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {email.subject || '(No Subject)'}
                    </div>
                    <div style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {email.body ? email.body.substring(0, 120) + '...' : '(No content)'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* EMAIL DETAIL */}
        <Card style={{
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.015)'
            : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(15px)',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.04)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <CardHeader style={{
            paddingBottom: '12px',
            borderBottom: isDark
              ? '1px solid rgba(255, 255, 255, 0.05)'
              : '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              color: isDark ? '#ffffff' : '#1f2937',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📖 Email Detail
            </h3>
          </CardHeader>
          <CardContent style={{ paddingTop: '12px', height: '420px', overflowY: 'auto' }}>
            {selectedEmail ? (
              <div>
                <div style={{
                  borderBottom: isDark
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  paddingBottom: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'hsl(var(--primary))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: '600',
                      fontSize: '18px'
                    }}>
                      {selectedEmail.from?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ color: isDark ? '#ffffff' : '#1f2937', fontWeight: '600' }}>
                        {selectedEmail.from?.split('<')[0].trim() || 'Unknown'}
                      </div>
                      <div style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
                        {selectedEmail.date ? new Date(selectedEmail.date).toLocaleString() : ''}
                      </div>
                    </div>
                  </div>
                  <h2 style={{
                    color: isDark ? '#ffffff' : '#1f2937',
                    fontWeight: '600',
                    fontSize: '18px',
                    marginBottom: '8px'
                  }}>
                    {selectedEmail.subject || '(No Subject)'}
                  </h2>
                </div>
                <div style={{
                  color: isDark ? '#ffffff' : '#1f2937',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}>
                  {selectedEmail.body || '(No content available)'}
                </div>
              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '16px' }}>✉️</div>
                <div style={{ fontSize: '18px', fontWeight: '500' }}>Select an email to read</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Click on any email in the list</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}