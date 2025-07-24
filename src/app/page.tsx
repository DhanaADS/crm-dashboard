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
          categories: ['General'], // You can enhance this based on sites
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
    // Refresh orders when a new order is created
    fetchOrders()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="text-primary-foreground text-2xl font-bold">A</div>
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <OrderProvider>
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: theme === 'dark' ? '#1a1a1a' : '#f5f5f5',
        overflowX: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          background: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(245, 245, 245, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          padding: '12px 24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Link href="/employees">
    <Button
      size="sm"
      variant="outline"
      className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
    >
      👨‍💼 Employees
    </Button>
  </Link>
  <Button
    onClick={toggleTheme}
    size="sm"
    variant="outline"
    className="h-8 px-3 text-sm button-inactive"
  >
    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
  </Button>
</div>
            <Button
              onClick={handleLogout}
              size="sm"
              variant="outline"
              className="h-8 px-4 text-sm button-inactive"
            >
              🔓 Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          padding: '16px 24px 24px 24px',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '100%',
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '24px',
            boxShadow: theme === 'dark' ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden'
          }}>
            {/* Dashboard Header */}
            <div style={{
              padding: '1.5rem 2rem',
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(15px)',
              borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div className="flex justify-center items-center mb-4">
                <div 
                  className="rounded-xl flex items-center justify-center shadow-lg"
                  style={{ 
                    width: '50px', 
                    height: '50px',
                    backgroundColor: '#000000'
                  }}
                >
                  <Image
                    src="/assets/ads-logo.png"
                    alt="ADS Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ADS Dashboard
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Advanced Digital Solutions Management
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-4 border-b" style={{
              borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <Button
                  onClick={() => {
                    setActiveTab('gmail')
                    fetchInbox()
                  }}
                  size="sm"
                  variant={activeTab === 'gmail' ? 'default' : 'outline'}
                  className={`h-8 px-4 text-sm ${activeTab === 'gmail' ? 'bg-red-600 hover:bg-red-700 text-white' : 'button-inactive'}`}
                >
                  📧 Gmail
                </Button>

                <Button
                  onClick={() => setActiveTab('whatsapp')}
                  size="sm"
                  variant={activeTab === 'whatsapp' ? 'default' : 'outline'}
                  className={`h-8 px-4 text-sm ${activeTab === 'whatsapp' ? 'bg-green-500 hover:bg-green-600 text-white' : 'button-inactive'}`}
                >
                  📱 WhatsApp
                </Button>

                <Button
                  onClick={() => setActiveTab('telegram')}
                  size="sm"
                  variant={activeTab === 'telegram' ? 'default' : 'outline'}
                  className={`h-8 px-4 text-sm ${activeTab === 'telegram' ? 'bg-sky-500 hover:bg-sky-600 text-white' : 'button-inactive'}`}
                >
                  💬 Telegram
                </Button>

                <Button
                  onClick={() => {
                    setActiveTab('orders')
                    fetchOrders()
                  }}
                  size="sm"
                  variant={activeTab === 'orders' ? 'default' : 'outline'}
                  className={`h-8 px-4 text-sm ${activeTab === 'orders' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'button-inactive'}`}
                >
                  📋 Orders
                </Button>

                <Button
                  onClick={() => {
                    setActiveTab('inventory')
                    fetchInventory()
                  }}
                  size="sm"
                  variant={activeTab === 'inventory' ? 'default' : 'outline'}
                  className={`h-8 px-4 text-sm ${activeTab === 'inventory' ? 'bg-zinc-600 hover:bg-zinc-700 text-white' : 'button-inactive'}`}
                >
                  📦 Inventory
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '1rem' }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {activeTab === 'gmail' && (
                  <TabsContent value="gmail" className="focus-visible:outline-none">
                    <EmailTable emails={emails} status={emailStatus} onRefresh={fetchInbox} />
                  </TabsContent>
                )}
                {activeTab === 'whatsapp' && (
                  <TabsContent value="whatsapp" className="focus-visible:outline-none">
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-4xl">📱</div>
                      </div>
                      <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        WhatsApp Integration
                      </h3>
                      <p className={`mb-4 max-w-md mx-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Connect your WhatsApp Business account.
                      </p>
                      <Button className="bg-green-500 hover:bg-green-600 text-white h-9 px-5">
                        🚀 Coming Soon
                      </Button>
                    </div>
                  </TabsContent>
                )}
                {activeTab === 'telegram' && (
                  <TabsContent value="telegram" className="focus-visible:outline-none">
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="text-4xl">💬</div>
                      </div>
                      <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Telegram Integration
                      </h3>
                      <p className={`mb-4 max-w-md mx-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Set up Telegram bots and channels.
                      </p>
                      <Button className="bg-sky-500 hover:bg-sky-600 text-white h-9 px-5">
                        🚀 Coming Soon
                      </Button>
                    </div>
                  </TabsContent>
                )}
                {activeTab === 'orders' && (
                  <TabsContent value="orders" className="focus-visible:outline-none">
                    {ordersStatus === 'idle' ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <div className="text-4xl">📋</div>
                        </div>
                        <h3 className={`text-xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Order Management
                        </h3>
                        <p className={`mb-4 max-w-md mx-auto text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Manage client orders and budget analysis.
                        </p>
                        <Button 
                          onClick={fetchOrders} 
                          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5"
                        >
                          📊 Load Orders
                        </Button>
                      </div>
                    ) : (
                      <OrderManagement 
                        orders={orders} 
                        status={ordersStatus} 
                        theme={theme}
                        onSwitchToInventory={handleSwitchToInventory}
                        onOrderCreated={handleOrderCreated}
                      />
                    )}
                  </TabsContent>
                )}
                {activeTab === 'inventory' && (
                  <TabsContent value="inventory" className="focus-visible:outline-none">
                    {inventoryStatus === 'idle' ? (
                      <div className="text-center py-16">
                        <div className="w-24 h-24 bg-zinc-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <div className="text-5xl">📦</div>
                        </div>
                        <h3 className={`text-2xl font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Inventory Management
                        </h3>
                        <p className={`mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Track domains and manage selections.
                        </p>
                        <Button 
                          onClick={fetchInventory} 
                          className="bg-zinc-600 hover:bg-zinc-700 text-white h-10 px-6"
                        >
                          📊 Load Inventory
                        </Button>
                      </div>
                    ) : (
                      <InventoryTable items={inventory} status={inventoryStatus} theme={theme} />
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </OrderProvider>
  )
}