'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, Filter, Plus, Eye, Edit, Calculator, 
  DollarSign, Target, TrendingUp, Clock, CheckCircle, 
  AlertCircle, User, Globe, FileText, ArrowRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrders, OrderItem } from '@/contexts/OrderContext'

interface OrderManagementProps {
  orders: OrderItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  theme: string
  onSwitchToInventory: () => void
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
  orders, 
  status, 
  theme,
  onSwitchToInventory 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [showBudgetCalculator, setShowBudgetCalculator] = useState(false)
  const { sendOrderToInventory } = useOrders()

  // Sample orders data (will be replaced by real data from props)
  const sampleOrders: OrderItem[] = [
    {
      id: 'ORD-001',
      clientName: 'TechCorp Solutions',
      clientEmail: 'john@techcorp.com',
      sitesRequested: 3,
      clientBudget: 500,
      companyProfitTarget: 60,
      requirements: {
        categories: ['Technology', 'Business'],
        minDA: 80,
        linkType: 'Editorial',
        niche: 'Software Development'
      },
      status: 'In Progress',
      createdDate: '2025-01-20',
      deadline: '2025-01-27',
      articlesNeeded: 3,
      estimatedCosts: {
        siteCosts: 240,
        articleFees: 60,
        totalCost: 300,
        profit: 200,
        profitMargin: 40
      }
    },
    {
      id: 'ORD-002',
      clientName: 'HealthPro Inc',
      clientEmail: 'sarah@healthpro.com',
      sitesRequested: 5,
      clientBudget: 800,
      companyProfitTarget: 60,
      requirements: {
        categories: ['Health', 'Medical'],
        minDA: 75,
        linkType: 'Guest Post',
        niche: 'Healthcare Technology'
      },
      status: 'Budget Analysis',
      createdDate: '2025-01-19',
      deadline: '2025-01-30',
      articlesNeeded: 5,
      estimatedCosts: {
        siteCosts: 400,
        articleFees: 100,
        totalCost: 500,
        profit: 300,
        profitMargin: 37.5
      }
    },
    {
      id: 'ORD-003',
      clientName: 'FinanceFlow Ltd',
      clientEmail: 'mike@financeflow.com',
      sitesRequested: 2,
      clientBudget: 350,
      companyProfitTarget: 60,
      requirements: {
        categories: ['Finance', 'Business'],
        minDA: 85,
        linkType: 'Resource Page',
        niche: 'Investment Banking'
      },
      status: 'Completed',
      createdDate: '2025-01-15',
      deadline: '2025-01-25',
      articlesNeeded: 2,
      estimatedCosts: {
        siteCosts: 160,
        articleFees: 40,
        totalCost: 200,
        profit: 150,
        profitMargin: 42.8
      }
    }
  ]

  const displayOrders = orders.length > 0 ? orders : sampleOrders

  const filteredOrders = useMemo(() => {
    return displayOrders.filter(order =>
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [displayOrders, searchTerm])

  const getStatusBadge = (status: string) => {
    const styles = {
      'In Progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Budget Analysis': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Completed': 'bg-green-500/20 text-green-400 border-green-500/30',
      'On Hold': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Draft': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'Inventory Selection': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles] || styles['On Hold']}`}>
        {status}
      </span>
    )
  }

  const BudgetCalculator = ({ order }: { order: OrderItem }) => {
    const [calculations, setCalculations] = useState({
      siteCosts: order.estimatedCosts.siteCosts,
      articleFees: order.estimatedCosts.articleFees,
      profitTarget: order.companyProfitTarget
    })

    const calculatedBudget = useMemo(() => {
      const totalCost = calculations.siteCosts + calculations.articleFees
      const profit = order.clientBudget - totalCost
      const profitMargin = (profit / order.clientBudget) * 100
      const maxBudgetForSites = (order.clientBudget * (100 - calculations.profitTarget)) / 100 - calculations.articleFees
      
      return {
        totalCost,
        profit,
        profitMargin: profitMargin.toFixed(1),
        maxBudgetForSites: maxBudgetForSites.toFixed(0),
        isViable: profitMargin >= calculations.profitTarget
      }
    }, [calculations, order])

    const handleSendToInventory = () => {
      const maxBudget = parseFloat(calculatedBudget.maxBudgetForSites)
      const orderWithBudget = {
        ...order,
        maxBudget,
        estimatedCosts: {
          ...order.estimatedCosts,
          siteCosts: calculations.siteCosts,
          articleFees: calculations.articleFees
        }
      }
      sendOrderToInventory(orderWithBudget)
      onSwitchToInventory()
    }

    return (
      <div 
        className="rounded-lg p-6"
        style={{ 
          backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Calculator className="w-5 h-5 text-blue-400" />
          Budget Calculator - {order.id}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Client Budget
              </label>
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
              >
                <span className="text-xl font-bold text-green-400">${order.clientBudget}</span>
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Site Costs
              </label>
              <input
                type="number"
                value={calculations.siteCosts}
                onChange={(e) => setCalculations(prev => ({...prev, siteCosts: Number(e.target.value)}))}
                className={`w-full border rounded-lg px-3 py-2 ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Article Fees
              </label>
              <input
                type="number"
                value={calculations.articleFees}
                onChange={(e) => setCalculations(prev => ({...prev, articleFees: Number(e.target.value)}))}
                className={`w-full border rounded-lg px-3 py-2 ${
                  theme === 'dark' 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
            >
              <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Budget Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Total Cost:</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${calculatedBudget.totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Profit:</span>
                  <span className={calculatedBudget.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                    ${calculatedBudget.profit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Profit Margin:</span>
                  <span className={parseFloat(calculatedBudget.profitMargin) >= calculations.profitTarget ? 'text-green-400' : 'text-red-400'}>
                    {calculatedBudget.profitMargin}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              calculatedBudget.isViable 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}>
              <div className="flex items-center gap-2">
                {calculatedBudget.isViable ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {calculatedBudget.isViable ? 'Budget is viable' : 'Budget needs adjustment'}
                </span>
              </div>
            </div>
            
            <Button 
              onClick={handleSendToInventory}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              Send to Inventory Selection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const OrderDetails = ({ order }: { order: OrderItem }) => (
    <div 
      className="rounded-lg p-6"
      style={{ 
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <FileText className="w-5 h-5 text-blue-400" />
          Order Details - {order.id}
        </h3>
        {getStatusBadge(order.status)}
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Client Information</h4>
            <div 
              className="p-3 rounded-lg space-y-2"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.clientName}</span>
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{order.clientEmail}</div>
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Order Requirements</h4>
            <div 
              className="p-3 rounded-lg space-y-2"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
            >
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Sites Requested:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.sitesRequested}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Min DA:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.requirements.minDA}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Link Type:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.requirements.linkType}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Categories:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.requirements.categories.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Budget & Timeline</h4>
            <div 
              className="p-3 rounded-lg space-y-2"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
            >
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Client Budget:</span>
                <span className="text-green-400 font-medium">${order.clientBudget}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Profit Target:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{order.companyProfitTarget}%</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Deadline:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{new Date(order.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cost Breakdown</h4>
            <div 
              className="p-3 rounded-lg space-y-2"
              style={{ backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' }}
            >
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Site Costs:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${order.estimatedCosts.siteCosts}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Article Fees:</span>
                <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>${order.estimatedCosts.articleFees}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Profit:</span>
                <span className="text-green-400">${order.estimatedCosts.profit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button 
          onClick={() => setShowBudgetCalculator(true)}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          Budget Calculator
        </Button>
        <Button 
          variant="outline"
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Globe className="w-4 h-4" />
          View Inventory
        </Button>
      </div>
    </div>
  )

  if (status === 'loading') {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading orders...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Error Loading Orders
        </h3>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          There was an error loading the orders. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {showBudgetCalculator && selectedOrder ? (
        <div className="space-y-6">
          <Button 
            variant="ghost"
            onClick={() => setShowBudgetCalculator(false)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Back to Orders
          </Button>
          <BudgetCalculator order={selectedOrder} />
        </div>
      ) : selectedOrder ? (
        <div className="space-y-6">
          <Button 
            variant="ghost"
            onClick={() => setSelectedOrder(null)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            ← Back to Orders
          </Button>
          <OrderDetails order={selectedOrder} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Management
              </h2>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Manage client orders and budget analysis
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </div>

          {/* Search */}
          <div 
            className="rounded-lg p-4"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' 
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline"
                className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div 
            className="rounded-lg overflow-hidden"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead 
                  style={{ 
                    backgroundColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.6)' : 'rgba(241, 245, 249, 0.8)' 
                  }}
                >
                  <tr>
                    <th className={`p-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Order ID</th>
                    <th className={`p-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Client</th>
                    <th className={`p-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Sites</th>
                    <th className={`p-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Budget</th>
                    <th className={`p-4 text-left ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`p-4 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className={`border-t transition-colors hover:${theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-100/50'}`}
                      style={{ 
                        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        backgroundColor: index % 2 === 0 
                          ? (theme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.3)')
                          : 'transparent'
                      }}
                    >
                      <td className="p-4">
                        <span className="font-medium text-blue-400">{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.clientName}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {order.clientEmail}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {order.sitesRequested}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-green-400">${order.clientBudget}</span>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 hover:bg-slate-600 rounded transition-colors" 
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 hover:bg-slate-600 rounded transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-gray-400 hover:text-blue-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowBudgetCalculator(true)
                            }}
                            className="p-1 hover:bg-slate-600 rounded transition-colors" 
                            title="Budget Calculator"
                          >
                            <Calculator className="w-4 h-4 text-gray-400 hover:text-green-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderManagement