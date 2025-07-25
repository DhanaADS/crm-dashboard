'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'
import EmailTable from '@/components/EmailTable'
import InventoryTable from '@/components/InventoryTable'
import OrderManagement from '@/components/OrderManagement'
import { EmailItem } from '@/types/email'
import { InventoryItem } from '@/types/inventory'
import { OrderItem } from '@/types/order'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { OrderProvider } from '@/contexts/OrderContext'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  ClipboardList, 
  Package,
  Sun,
  Moon,
  LogOut,
  Users,
  Activity,
  TrendingUp,
  Zap,
  Bell,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import styles from './HomePage.module.css'

const allowedEmails = [
  'dhana@aggrandizedigital.com',
  'saravana@aggrandizedigital.com',
  'veera@aggrandizedigital.com',
]

export default function HomePage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryStatus, setInventoryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [ordersStatus, setOrdersStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [theme, setTheme] = useState('dark')
  const [activeTab, setActiveTab] = useState('gmail')

  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const savedTheme = localStorage.getItem('ads-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.className = savedTheme
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('ads-theme', newTheme)
    document.documentElement.className = newTheme
  }

  useEffect(() => {
    const checkAuth = async () => {
      const response = await supabase.auth.getSession()
      const session = response?.data?.session
      const email = session?.user?.email || ''
      if (!session?.user?.email || !allowedEmails.includes(session.user.email)) {
        await supabase.auth.signOut()
        router.push('/login')
      } else {
        setAuthChecked(true)
      }
    }
    checkAuth()
  }, [router, supabase])

  const fetchInbox = async () => {
    try {
      setEmailStatus('loading')
      const res = await fetch('/api/emails')
      const data: { inbox?: EmailItem[] } = await res.json()
      setEmails(Array.isArray(data.inbox) ? data.inbox : [])
      setEmailStatus('success')
    } catch (err) {
      console.error('Inbox fetch error:', err)
      setEmailStatus('error')
    }
  }

  const fetchInventory = async () => {
    try {
      setInventoryStatus('loading')
      const { data, error } = await supabase.from('web_inventory').select('*')
      if (error) throw error
      setInventory(data || [])
      setInventoryStatus('success')
    } catch (err) {
      console.error('Inventory fetch error:', err)
      setInventoryStatus('error')
    }
  }

  const fetchOrders = async () => {
    try {
      setOrdersStatus('loading')
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_sites (*)
        `)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.log('Orders table might not exist yet, using sample data')
        setOrders([])
        setOrdersStatus('success')
        return
      }

      // Transform data to match your existing OrderItem interface
      const transformedOrders = ordersData.map(order => ({
        id: order.order_id,
        clientName: order.client_name,
        clientEmail: order.client_email,
        sitesRequested: order.order_sites?.length || 0,
        clientBudget: order.total_budget,
        companyProfitTarget: order.profit_margin,
        requirements: {
          categories: ['General'],
          minDA: 50,
          linkType: 'Guest Post',
          niche: 'General'
        },
        status: order.status,
        createdDate: order.created_at.split('T')[0],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        articlesNeeded: order.order_sites?.length || 0,
        estimatedCosts: {
          siteCosts: order.order_sites?.reduce((sum: number, site: any) => sum + site.site_price, 0) || 0,
          articleFees: order.order_sites?.reduce((sum: number, site: any) => sum + site.article_fee, 0) || 0,
          totalCost: order.order_sites?.reduce((sum: number, site: any) => sum + site.site_price + site.article_fee, 0) || 0,
          profit: order.total_budget - (order.order_sites?.reduce((sum: number, site: any) => sum + site.site_price + site.article_fee, 0) || 0),
          profitMargin: order.profit_margin
        }
      }))

      setOrders(transformedOrders)
      setOrdersStatus('success')
    } catch (err) {
      console.error('Orders fetch error:', err)
      setOrders([])
      setOrdersStatus('success')
    }
  }

  const handleSwitchToInventory = () => {
    setActiveTab('inventory')
    if (inventoryStatus === 'idle') {
      fetchInventory()
    }
  }

  const handleOrderCreated = () => {
    fetchOrders()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <div className={`${styles.loadingScreen} ${theme === 'dark' ? styles.loadingScreenDark : styles.loadingScreenLight}`}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingIconContainer}>
            <div className={styles.loadingIcon}>
              <Sparkles className={styles.loadingIconSparkles} />
            </div>
            <div className={`${styles.loadingIconIndicator} ${theme === 'dark' ? styles.loadingIconIndicatorDark : styles.loadingIconIndicatorLight}`}></div>
          </div>
          <h2 className={`${styles.loadingTitle} ${theme === 'dark' ? styles.loadingTitleDark : styles.loadingTitleLight}`}>
            Initializing Dashboard
          </h2>
          <p className={`${styles.loadingSubtitle} ${theme === 'dark' ? styles.loadingSubtitleDark : styles.loadingSubtitleLight}`}>
            Verifying your credentials...
          </p>
          <div className={styles.loadingDots}>
            <div className={styles.loadingDotsContainer}>
              <div className={`${styles.loadingDot} ${styles.loadingDotBlue}`}></div>
              <div className={`${styles.loadingDot} ${styles.loadingDotPurple}`}></div>
              <div className={`${styles.loadingDot} ${styles.loadingDotPink}`}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const navigationTabs = [
    {
      key: 'gmail',
      label: 'Gmail',
      icon: Mail,
      activeClass: styles.tabGmail,
      inactiveClass: styles.tabGmailInactive,
      action: () => {
        setActiveTab('gmail')
        fetchInbox()
      }
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      activeClass: styles.tabWhatsapp,
      inactiveClass: styles.tabWhatsappInactive,
      action: () => setActiveTab('whatsapp')
    },
    {
      key: 'telegram',
      label: 'Telegram',
      icon: Send,
      activeClass: styles.tabTelegram,
      inactiveClass: styles.tabTelegramInactive,
      action: () => setActiveTab('telegram')
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      activeClass: styles.tabOrders,
      inactiveClass: styles.tabOrdersInactive,
      action: () => {
        setActiveTab('orders')
        fetchOrders()
      }
    },
    {
      key: 'inventory',
      label: 'Inventory',
      icon: Package,
      activeClass: styles.tabInventory,
      inactiveClass: styles.tabInventoryInactive,
      action: () => {
        setActiveTab('inventory')
        fetchInventory()
      }
    }
  ]

  return (
    <OrderProvider>
      <div className={`${styles.dashboardContainer} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}>
        
        {/* Modern Header */}
        <header className={`${styles.header} ${theme === 'dark' ? styles.headerDark : styles.headerLight}`}>
          <div className={styles.headerContent}>
            {/* Logo Section */}
            <div className={styles.logoSection}>
              <div className={styles.logoContainer}>
                <Image
                  src="/assets/ads-logo.png"
                  alt="ADS Logo"
                  width={26}
                  height={26}
                  className="object-contain"
                />
                <div className={styles.statusIndicator}></div>
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoTitle}>
                  ADS Dashboard
                </span>
                <div className={`${styles.logoSubtitle} ${theme === 'dark' ? styles.logoSubtitleDark : styles.logoSubtitleLight}`}>
                  Advanced Management System
                </div>
              </div>
            </div>
            
            {/* Right Actions */}
            <div className={styles.actionBar}>
              {/* Quick Stats */}
              <div className={`${styles.quickStats} ${theme === 'dark' ? styles.quickStatsDark : styles.quickStatsLight}`}>
                <div className={styles.statItem}>
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className={`${styles.statText} ${theme === 'dark' ? styles.statTextDark : styles.statTextLight}`}>
                    Live
                  </span>
                </div>
                <div className={`${styles.divider} ${theme === 'dark' ? styles.dividerDark : styles.dividerLight}`}></div>
                <div className={styles.statItem}>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className={`${styles.statText} ${theme === 'dark' ? styles.statTextDark : styles.statTextLight}`}>
                    {emails.length} Items
                  </span>
                </div>
              </div>

              {/* Notification Bell */}
              <button className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight} relative`}>
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>

              {/* Employees Link */}
              <Link href="/employees">
                <button className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight}`}>
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Team</span>
                </button>
              </Link>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`${styles.actionButton} ${theme === 'dark' ? styles.actionButtonDark : styles.actionButtonLight}`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Dark</span>
                  </>
                )}
              </button>
              
              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`${styles.logoutButton} ${theme === 'dark' ? styles.logoutButtonDark : styles.logoutButtonLight}`}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={`${styles.dashboardCard} ${theme === 'dark' ? styles.dashboardCardDark : styles.dashboardCardLight}`}>
            
            {/* Hero Dashboard Header */}
            <div className={`${styles.heroSection} ${theme === 'dark' ? styles.heroSectionDark : styles.heroSectionLight}`}>
              <div className={styles.gridPattern}></div>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <div className={styles.heroTitle}>
                    <Zap className="h-8 w-8 text-yellow-500" />
                    <h1 className={styles.heroMainTitle}>
                      Dashboard Command
                    </h1>
                  </div>
                  <p className={`${styles.heroDescription} ${theme === 'dark' ? styles.heroDescriptionDark : styles.heroDescriptionLight}`}>
                    Your centralized mission control for managing communications, orders, and inventory with 
                    <span className={`${styles.highlight} ${styles.highlightBlue}`}> intelligent automation</span> and 
                    <span className={`${styles.highlight} ${styles.highlightPurple}`}> real-time insights</span>.
                  </p>
                </div>
                
                {/* Quick Action Cards */}
                <div className={styles.quickStatsGrid}>
                  <div className={`${styles.statCard} ${styles.statCardBlue} ${theme === 'dark' ? styles.statCardBlueDark : styles.statCardBlueLight}`}>
                    <div className={styles.statCardContent}>
                      <div className={`${styles.statValue} ${styles.statValueBlue}`}>{emails.length}</div>
                      <div className={`${styles.statLabel} ${theme === 'dark' ? styles.statLabelDark : styles.statLabelLight}`}>Active Emails</div>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.statCardPurple} ${theme === 'dark' ? styles.statCardPurpleDark : styles.statCardPurpleLight}`}>
                    <div className={styles.statCardContent}>
                      <div className={`${styles.statValue} ${styles.statValuePurple}`}>{orders.length}</div>
                      <div className={`${styles.statLabel} ${theme === 'dark' ? styles.statLabelDark : styles.statLabelLight}`}>Live Orders</div>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.statCardGreen} ${theme === 'dark' ? styles.statCardGreenDark : styles.statCardGreenLight}`}>
                    <div className={styles.statCardContent}>
                      <div className={`${styles.statValue} ${styles.statValueGreen}`}>{inventory.length}</div>
                      <div className={`${styles.statLabel} ${theme === 'dark' ? styles.statLabelDark : styles.statLabelLight}`}>Inventory Items</div>
                    </div>
                  </div>
                  <div className={`${styles.statCard} ${styles.statCardOrange} ${theme === 'dark' ? styles.statCardOrangeDark : styles.statCardOrangeLight}`}>
                    <div className={styles.statCardContent}>
                      <div className={`${styles.statValue} ${styles.statValueOrange}`}>98%</div>
                      <div className={`${styles.statLabel} ${theme === 'dark' ? styles.statLabelDark : styles.statLabelLight}`}>Uptime</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Navigation Tabs */}
            <div className={`${styles.navigationSection} ${theme === 'dark' ? styles.navigationSectionDark : styles.navigationSectionLight}`}>
              <div className={styles.tabsContainer}>
                {navigationTabs.map((tab) => {
                  const IconComponent = tab.icon
                  const isActive = activeTab === tab.key
                  
                  return (
                    <button
                      key={tab.key}
                      onClick={tab.action}
                      className={`${styles.tabButton} ${
                        isActive 
                          ? `${styles.tabButtonActive} ${tab.activeClass}` 
                          : `${styles.tabButtonInactive} ${tab.inactiveClass} ${theme === 'dark' ? styles.tabButtonInactiveDark : styles.tabButtonInactiveLight}`
                      }`}
                    >
                      <IconComponent className={`${styles.tabIcon} ${isActive ? styles.tabIconActive : ''}`} />
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className={styles.activeIndicator}>
                          <div className={styles.activeIndicatorDot}></div>
                        </div>
                      )}
                      <ArrowRight className={styles.arrowIcon} />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {activeTab === 'gmail' && (
                  <TabsContent value="gmail" className="mt-0 focus-visible:outline-none">
                    <div className={styles.contentSection}>
                      <EmailTable emails={emails} status={emailStatus} onRefresh={fetchInbox} />
                    </div>
                  </TabsContent>
                )}
                {activeTab === 'whatsapp' && (
                  <TabsContent value="whatsapp" className="mt-0 focus-visible:outline-none">
                    <div className={styles.comingSoonContainer}>
                      <div className={styles.comingSoonIcon}>
                        <div className={`${styles.comingSoonIconCard} ${styles.comingSoonIconCardGreen} ${theme === 'dark' ? styles.comingSoonIconCardGreenDark : styles.comingSoonIconCardGreenLight}`}>
                          <MessageSquare className={`${styles.comingSoonMainIcon} ${theme === 'dark' ? styles.comingSoonMainIconGreenDark : styles.comingSoonMainIconGreen}`} />
                        </div>
                        <div className={`${styles.comingSoonFloatingIcon} ${styles.comingSoonFloatingIconGreen}`}></div>
                      </div>
                      <h3 className={`${styles.comingSoonTitle} ${styles.comingSoonTitleGreen}`}>
                        WhatsApp Business Hub
                      </h3>
                      <p className={`${styles.comingSoonDescription} ${theme === 'dark' ? styles.comingSoonDescriptionDark : styles.comingSoonDescriptionLight}`}>
                        Seamlessly integrate your WhatsApp Business API to manage customer conversations, 
                        automated responses, and broadcast campaigns from your unified dashboard.
                      </p>
                      <div className={styles.comingSoonActions}>
                        <button className={`${styles.primaryButton} ${styles.primaryButtonGreen}`} disabled>
                          <Sparkles className="h-4 w-4" />
                          Coming Soon
                        </button>
                        <button className={`${styles.secondaryButton} ${theme === 'dark' ? styles.secondaryButtonGreenDark : styles.secondaryButtonGreen}`}>
                          Learn More
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                )}
                {activeTab === 'telegram' && (
                  <TabsContent value="telegram" className="mt-0 focus-visible:outline-none">
                    <div className={styles.comingSoonContainer}>
                      <div className={styles.comingSoonIcon}>
                        <div className={`${styles.comingSoonIconCard} ${styles.comingSoonIconCardBlue} ${theme === 'dark' ? styles.comingSoonIconCardBlueDark : styles.comingSoonIconCardBlueLight}`}>
                          <Send className={`${styles.comingSoonMainIcon} ${theme === 'dark' ? styles.comingSoonMainIconBlueDark : styles.comingSoonMainIconBlue}`} />
                        </div>
                        <div className={`${styles.comingSoonFloatingIcon} ${styles.comingSoonFloatingIconBlue}`}></div>
                      </div>
                      <h3 className={`${styles.comingSoonTitle} ${styles.comingSoonTitleBlue}`}>
                        Telegram Automation Center
                      </h3>
                      <p className={`${styles.comingSoonDescription} ${theme === 'dark' ? styles.comingSoonDescriptionDark : styles.comingSoonDescriptionLight}`}>
                        Deploy intelligent Telegram bots, manage channels, and automate customer support 
                        with advanced scripting and real-time analytics integration.
                      </p>
                      <div className={styles.comingSoonActions}>
                        <button className={`${styles.primaryButton} ${styles.primaryButtonBlue}`} disabled>
                          <Sparkles className="h-4 w-4" />
                          Coming Soon
                        </button>
                        <button className={`${styles.secondaryButton} ${theme === 'dark' ? styles.secondaryButtonBlueDark : styles.secondaryButtonBlue}`}>
                          Learn More
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                )}
                {activeTab === 'orders' && (
                  <TabsContent value="orders" className="mt-0 focus-visible:outline-none">
                    {ordersStatus === 'idle' ? (
                      <div className={styles.comingSoonContainer}>
                        <div className={styles.comingSoonIcon}>
                          <div className={`${styles.comingSoonIconCard} ${styles.comingSoonIconCardPurple} ${theme === 'dark' ? styles.comingSoonIconCardPurpleDark : styles.comingSoonIconCardPurpleLight}`}>
                            <ClipboardList className={`${styles.comingSoonMainIcon} ${theme === 'dark' ? styles.comingSoonMainIconPurpleDark : styles.comingSoonMainIconPurple}`} />
                          </div>
                          <div className={`${styles.comingSoonFloatingIcon} ${styles.comingSoonFloatingIconPurple}`}></div>
                        </div>
                        <h3 className={`${styles.comingSoonTitle} ${styles.comingSoonTitlePurple}`}>
                          Order Management System
                        </h3>
                        <p className={`${styles.comingSoonDescription} ${theme === 'dark' ? styles.comingSoonDescriptionDark : styles.comingSoonDescriptionLight}`}>
                          Advanced order processing with intelligent budget analysis, client management, 
                          and automated workflow optimization for maximum efficiency.
                        </p>
                        <div className={styles.comingSoonActions}>
                          <button 
                            onClick={fetchOrders} 
                            className={`${styles.primaryButton} ${styles.primaryButtonPurple}`}
                          >
                            <Zap className="h-4 w-4" />
                            Load Orders
                          </button>
                          <button className={`${styles.secondaryButton} ${theme === 'dark' ? styles.secondaryButtonPurpleDark : styles.secondaryButtonPurple}`}>
                            View Analytics
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.contentSection}>
                        <OrderManagement 
                          orders={orders} 
                          status={ordersStatus} 
                          theme={theme}
                          onSwitchToInventory={handleSwitchToInventory}
                          onOrderCreated={handleOrderCreated}
                        />
                      </div>
                    )}
                  </TabsContent>
                )}
                {activeTab === 'inventory' && (
                  <TabsContent value="inventory" className="mt-0 focus-visible:outline-none">
                    {inventoryStatus === 'idle' ? (
                      <div className={styles.comingSoonContainer}>
                        <div className={styles.comingSoonIcon}>
                          <div className={`${styles.comingSoonIconCard} ${styles.comingSoonIconCardOrange} ${theme === 'dark' ? styles.comingSoonIconCardOrangeDark : styles.comingSoonIconCardOrangeLight}`}>
                            <Package className={`${styles.comingSoonMainIcon} ${theme === 'dark' ? styles.comingSoonMainIconOrangeDark : styles.comingSoonMainIconOrange}`} />
                          </div>
                          <div className={`${styles.comingSoonFloatingIcon} ${styles.comingSoonFloatingIconOrange}`}></div>
                        </div>
                        <h3 className={`${styles.comingSoonTitle} ${styles.comingSoonTitleOrange}`}>
                          Smart Inventory Control
                        </h3>
                        <p className={`${styles.comingSoonDescription} ${theme === 'dark' ? styles.comingSoonDescriptionDark : styles.comingSoonDescriptionLight}`}>
                          Intelligent domain tracking with AI-powered categorization, automated alerts, 
                          and predictive analytics for optimal resource management.
                        </p>
                        <div className={styles.comingSoonActions}>
                          <button 
                            onClick={fetchInventory} 
                            className={`${styles.primaryButton} ${styles.primaryButtonOrange}`}
                          >
                            <Package className="h-4 w-4" />
                            Load Inventory
                          </button>
                          <button className={`${styles.secondaryButton} ${theme === 'dark' ? styles.secondaryButtonOrangeDark : styles.secondaryButtonOrange}`}>
                            Quick Scan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.contentSection}>
                        <InventoryTable items={inventory} status={inventoryStatus} theme={theme} />
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          {/* Footer with Modern Stats */}
          <div className={styles.footerStats}>
            <div className={`${styles.footerStatCard} ${theme === 'dark' ? styles.footerStatCardDark : styles.footerStatCardLight}`}>
              <div className={styles.footerStatContent}>
                <div className={`${styles.footerStatIcon} ${styles.footerStatIconBluePurple}`}>
                  <Activity className={styles.footerStatIconImage} />
                </div>
                <div className={styles.footerStatText}>
                  <div className={`${styles.footerStatLabel} ${theme === 'dark' ? styles.footerStatLabelDark : styles.footerStatLabelLight}`}>
                    System Status
                  </div>
                  <div className={`${styles.footerStatValue} ${styles.footerStatValueGreen}`}>
                    All Systems Operational
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.footerStatCard} ${theme === 'dark' ? styles.footerStatCardDark : styles.footerStatCardLight}`}>
              <div className={styles.footerStatContent}>
                <div className={`${styles.footerStatIcon} ${styles.footerStatIconGreenEmerald}`}>
                  <TrendingUp className={styles.footerStatIconImage} />
                </div>
                <div className={styles.footerStatText}>
                  <div className={`${styles.footerStatLabel} ${theme === 'dark' ? styles.footerStatLabelDark : styles.footerStatLabelLight}`}>
                    Performance
                  </div>
                  <div className={`${styles.footerStatValue} ${styles.footerStatValueBlue}`}>
                    +23% This Week
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.footerStatCard} ${theme === 'dark' ? styles.footerStatCardDark : styles.footerStatCardLight}`}>
              <div className={styles.footerStatContent}>
                <div className={`${styles.footerStatIcon} ${styles.footerStatIconOrangeRed}`}>
                  <Zap className={styles.footerStatIconImage} />
                </div>
                <div className={styles.footerStatText}>
                  <div className={`${styles.footerStatLabel} ${theme === 'dark' ? styles.footerStatLabelDark : styles.footerStatLabelLight}`}>
                    Response Time
                  </div>
                  <div className={`${styles.footerStatValue} ${styles.footerStatValuePurple}`}>
                    2.3s Average
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </OrderProvider>
  )
}