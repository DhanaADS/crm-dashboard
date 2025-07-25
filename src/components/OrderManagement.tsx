'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, Filter, Plus, Eye, Edit, Calculator, 
  DollarSign, Target, TrendingUp, Clock, CheckCircle, 
  AlertCircle, User, Globe, FileText, ArrowRight, Download,
  Calendar, BarChart3, Settings, TrendingDown, Users,
  Package, Activity, Star, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOrders, OrderItem } from '@/contexts/OrderContext'
import NewOrderModal from './orders/NewOrderModal'
import '../styles/OrderManagement.css'


interface OrderManagementProps {
  orders: OrderItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
  theme: string
  onSwitchToInventory: () => void
  onOrderCreated?: () => void
}

const OrderManagement: React.FC<OrderManagementProps> = ({ 
  orders, 
  status, 
  theme,
  onSwitchToInventory,
  onOrderCreated
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [showBudgetCalculator, setShowBudgetCalculator] = useState(false)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const { sendOrderToInventory } = useOrders()

  // Enhanced sample orders data
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
    const statusClass = status.toLowerCase().replace(/\s+/g, '-')
    return (
      <span className={`order-status-badge status-${statusClass}`}>
        {status}
      </span>
    )
  }

  const getDaysAgo = (dateString: string) => {
    const orderDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - orderDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDownloadReport = () => {
    const reportData = {
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalOrders: filteredOrders.length,
      completedOrders: filteredOrders.filter(o => o.status === 'Completed').length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + order.clientBudget, 0),
      averageOrderValue: filteredOrders.reduce((sum, order) => sum + order.clientBudget, 0) / filteredOrders.length
    }
    
    console.log('Downloading report:', reportData)
    alert(`Monthly Report Generated!\n\nTotal Orders: ${reportData.totalOrders}\nCompleted: ${reportData.completedOrders}\nTotal Revenue: $${reportData.totalRevenue}\nAvg Order Value: $${Math.round(reportData.averageOrderValue)}`)
  }

  const handleOrderCreated = () => {
    if (onOrderCreated) {
      onOrderCreated()
    }
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
      <div className="budget-calculator-container">
        <div className="budget-calculator-header">
          <Calculator className="budget-calculator-icon" />
          <h3 className="budget-calculator-title">Budget Calculator - {order.id}</h3>
        </div>
        
        <div className="budget-calculator-grid">
          <div className="budget-calculator-section">
            <div className="budget-input-group">
              <label className="budget-input-label">
                Client Budget
              </label>
              <div className="budget-input-display">
                <span className="budget-input-value">${order.clientBudget}</span>
              </div>
            </div>
            
            <div className="budget-input-group">
              <label className="budget-input-label">
                Site Costs
              </label>
              <input
                type="number"
                value={calculations.siteCosts}
                onChange={(e) => setCalculations(prev => ({...prev, siteCosts: Number(e.target.value)}))}
                className="budget-input"
              />
            </div>
            
            <div className="budget-input-group">
              <label className="budget-input-label">
                Article Fees
              </label>
              <input
                type="number"
                value={calculations.articleFees}
                onChange={(e) => setCalculations(prev => ({...prev, articleFees: Number(e.target.value)}))}
                className="budget-input"
              />
            </div>
          </div>
          
          <div className="budget-calculator-section">
            <div className="budget-analysis-panel">
              <h4 className="budget-analysis-title">Budget Analysis</h4>
              <div className="budget-analysis-items">
                <div className="budget-analysis-item">
                  <span className="budget-analysis-label">Total Cost:</span>
                  <span className="budget-analysis-value">${calculatedBudget.totalCost}</span>
                </div>
                <div className="budget-analysis-item">
                  <span className="budget-analysis-label">Profit:</span>
                  <span className={`budget-analysis-value ${calculatedBudget.profit > 0 ? 'positive' : 'negative'}`}>
                    ${calculatedBudget.profit}
                  </span>
                </div>
                <div className="budget-analysis-item">
                  <span className="budget-analysis-label">Profit Margin:</span>
                  <span className={`budget-analysis-value ${parseFloat(calculatedBudget.profitMargin) >= calculations.profitTarget ? 'positive' : 'negative'}`}>
                    {calculatedBudget.profitMargin}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`budget-viability-panel ${calculatedBudget.isViable ? 'viable' : 'not-viable'}`}>
              <div>
                {calculatedBudget.isViable ? (
                  <CheckCircle className="budget-viability-icon" />
                ) : (
                  <AlertCircle className="budget-viability-icon" />
                )}
              </div>
              <span className="budget-viability-text">
                {calculatedBudget.isViable ? 'Budget is viable' : 'Budget needs adjustment'}
              </span>
            </div>
            
            <button 
              onClick={handleSendToInventory}
              className="budget-send-button"
            >
              <ArrowRight className="w-5 h-5" />
              Send to Inventory Selection
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="order-loading-container">
        <div className="order-loading-content">
          <div className="order-loading-spinner"></div>
          <p className="order-loading-title">Loading orders...</p>
          <p className="order-loading-subtitle">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="order-error-container">
        <div className="order-error-content">
          <div className="order-error-icon-wrapper">
            <AlertCircle className="order-error-icon" />
          </div>
          <h3 className="order-error-title">Error Loading Orders</h3>
          <p className="order-error-message">There was an error loading the orders. Please try again.</p>
          <button className="order-btn order-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-management-container">
      <div className="order-management-wrapper">
        {showBudgetCalculator && selectedOrder ? (
          <div>
            <button 
              onClick={() => setShowBudgetCalculator(false)}
              className="budget-back-button"
            >
              ← Back to Orders
            </button>
            <BudgetCalculator order={selectedOrder} />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="order-header">
              <div className="order-header-top">
                <div className="order-title-section">
                  <h1>Order Management</h1>
                  <p className="order-subtitle">
                    {filteredOrders.length} orders found
                  </p>
                </div>
                <div className="order-actions">
                  <button 
                    onClick={handleDownloadReport}
                    className="order-btn order-btn-outline"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button 
                    onClick={() => setShowNewOrderModal(true)}
                    className="order-btn order-btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="order-search-section">
                <div className="order-search-controls">
                  <div className="order-search-wrapper">
                    <Search className="order-search-icon" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="order-search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button className="order-btn order-btn-outline">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="order-table-container">
              <div className="order-table-wrapper">
                <table className="order-table">
                  <thead className="order-table-header">
                    <tr>
                      <th>Order ID</th>
                      <th>Client</th>
                      <th>Sites</th>
                      <th>Budget</th>
                      <th>Order Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="order-table-body">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="order-table-row"
                      >
                        <td className="order-table-cell order-id-cell">
                          <div>
                            <div className="order-id-primary">{order.id}</div>
                            <div className="order-id-secondary">{order.requirements.linkType}</div>
                          </div>
                        </td>
                        <td className="order-table-cell order-client-cell">
                          <div>
                            <div className="order-client-name">{order.clientName}</div>
                            <div className="order-client-email">{order.clientEmail}</div>
                          </div>
                        </td>
                        <td className="order-table-cell">
                          <div className="order-sites-count">
                            <Package className="order-sites-icon" />
                            {order.sitesRequested}
                          </div>
                        </td>
                        <td className="order-table-cell">
                          <div className="order-budget-amount">
                            <DollarSign className="order-budget-icon" />
                            ${order.clientBudget}
                          </div>
                        </td>
                        <td className="order-table-cell order-date-cell">
                          <div>
                            <div className="order-date-primary">
                              {new Date(order.createdDate).toLocaleDateString()}
                            </div>
                            <div className="order-date-secondary">
                              <Clock className="order-date-icon" />
                              {getDaysAgo(order.createdDate)} days ago
                            </div>
                          </div>
                        </td>
                        <td className="order-table-cell">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="order-table-cell order-actions-cell">
                          <div className="order-action-buttons">
                            <button
                              className="order-action-btn"
                              onClick={() => setSelectedOrder(order)}
                              title="View"
                            >
                              <Eye className="order-action-icon" />
                            </button>
                            <button
                              className="order-action-btn"
                              title="Edit"
                            >
                              <Edit className="order-action-icon" />
                            </button>
                            <button
                              className="order-action-btn"
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowBudgetCalculator(true)
                              }}
                              title="Budget Calculator"
                            >
                              <Calculator className="order-action-icon" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* New Order Modal */}
        <NewOrderModal
          isOpen={showNewOrderModal}
          onClose={() => setShowNewOrderModal(false)}
          onOrderCreated={handleOrderCreated}
        />
      </div>
    </div>
  )
}

export default OrderManagement