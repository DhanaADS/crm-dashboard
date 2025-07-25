'use client'

import React, { useState, useEffect } from 'react'
import styles from './EmailFilters.module.css'

type EmailFiltersProps = {
  source?: 'Gmail' | 'WhatsApp' | 'Telegram'
  onSourceChange?: (source: 'Gmail' | 'WhatsApp' | 'Telegram') => void
  onFilterChange?: (filter: string) => void
}

export default function EmailFilters({ 
  source = 'Gmail', 
  onSourceChange,
  onFilterChange 
}: EmailFiltersProps) {
  const [theme, setTheme] = useState('dark')
  const [activeSource, setActiveSource] = useState(source)
  const [selectedFilter, setSelectedFilter] = useState('All Filters')

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

  const handleSourceChange = (newSource: 'Gmail' | 'WhatsApp' | 'Telegram') => {
    setActiveSource(newSource)
    onSourceChange?.(newSource)
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    onFilterChange?.(filter)
  }

  const sources = [
    { id: 'Gmail', icon: '📧', name: 'Gmail', color: '#ea4335' },
    { id: 'WhatsApp', icon: '📱', name: 'WhatsApp', color: '#25d366' },
    { id: 'Telegram', icon: '✈️', name: 'Telegram', color: '#0088cc' }
  ] as const

  const filters = [
    'All Filters',
    'Name',
    'ID', 
    'Subject',
    'Body',
    'Date'
  ]

  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.containerDark : styles.containerLight}`}>
      {/* Animated Background */}
      <div className={styles.backgroundPattern}></div>
      
      <div className={styles.content}>
        {/* Source Selection */}
        <div className={styles.sourceSection}>
          <div className={styles.sectionLabel}>
            <span className={styles.labelIcon}>📂</span>
            Message Source
          </div>
          <div className={styles.sourceButtons}>
            {sources.map((sourceItem) => (
              <button
                key={sourceItem.id}
                onClick={() => handleSourceChange(sourceItem.id)}
                className={`${styles.sourceButton} ${
                  activeSource === sourceItem.id ? styles.sourceActive : ''
                }`}
                style={{
                  '--source-color': sourceItem.color
                } as React.CSSProperties}
              >
                <span className={styles.sourceIcon}>{sourceItem.icon}</span>
                <span className={styles.sourceName}>{sourceItem.name}</span>
                {activeSource === sourceItem.id && (
                  <span className={styles.activeIndicator}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        {activeSource === 'Gmail' && (
          <div className={styles.filterSection}>
            <div className={styles.sectionLabel}>
              <span className={styles.labelIcon}>🔍</span>
              Filter Options
            </div>
            <div className={styles.filterDropdown}>
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className={`${styles.filterSelect} ${theme === 'dark' ? styles.filterSelectDark : styles.filterSelectLight}`}
              >
                {filters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
              <div className={styles.selectIcon}>⚙️</div>
            </div>
          </div>
        )}

        {/* Status Display */}
        <div className={styles.statusSection}>
          <div className={styles.statusInfo}>
            <span className={styles.statusText}>
              Showing messages for: 
            </span>
            <span className={styles.statusValue}>
              {activeSource}
            </span>
          </div>
          {activeSource === 'Gmail' && selectedFilter !== 'All Filters' && (
            <div className={styles.filterInfo}>
              <span className={styles.filterText}>
                Filtered by: 
              </span>
              <span className={styles.filterValue}>
                {selectedFilter}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}