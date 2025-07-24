'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import OrderManagement from '@/components/OrderManagement'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const supabase = createClientComponentClient()
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      setStatus('loading')
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_sites (*)
        `)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

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
      setStatus('success')
    } catch (error) {
      console.error('Error fetching orders:', error)
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Order Management</h1>
              <p className="text-slate-400">Manage all client orders and campaigns</p>
            </div>
          </div>
          
          <Button
            onClick={() => router.push('/orders/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>

        {/* Orders Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <OrderManagement 
            orders={orders}
            status={status}
            theme="dark"
            onSwitchToInventory={() => router.push('/?tab=inventory')}
          />
        </div>
      </div>
    </div>
  )
}