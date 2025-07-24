'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface OrderItem {
  id: string
  clientName: string
  clientEmail: string
  sitesRequested: number
  clientBudget: number
  companyProfitTarget: number
  maxBudget?: number
  requirements: {
    categories: string[]
    minDA: number
    linkType: string
    niche: string
  }
  status: 'Draft' | 'In Progress' | 'Budget Analysis' | 'Inventory Selection' | 'Completed' | 'On Hold' | 'Cancelled'
  createdDate: string
  deadline: string
  articlesNeeded: number
  estimatedCosts: {
    siteCosts: number
    articleFees: number
    totalCost: number
    profit: number
    profitMargin: number
  }
  selectedDomains?: number[]
}

interface OrderContextType {
  orders: OrderItem[]
  activeOrder: OrderItem | null
  selectedForInventory: OrderItem | null
  setActiveOrder: (order: OrderItem | null) => void
  setSelectedForInventory: (order: OrderItem | null) => void
  addOrder: (order: OrderItem) => void
  updateOrder: (orderId: string, updates: Partial<OrderItem>) => void
  sendOrderToInventory: (order: OrderItem) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [activeOrder, setActiveOrder] = useState<OrderItem | null>(null)
  const [selectedForInventory, setSelectedForInventory] = useState<OrderItem | null>(null)

  const addOrder = (order: OrderItem) => {
    setOrders(prev => [...prev, order])
  }

  const updateOrder = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    )
  }

  const sendOrderToInventory = (order: OrderItem) => {
    setSelectedForInventory(order)
    setActiveOrder(order)
  }

  const value: OrderContextType = {
    orders,
    activeOrder,
    selectedForInventory,
    setActiveOrder,
    setSelectedForInventory,
    addOrder,
    updateOrder,
    sendOrderToInventory
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}

export const useOrders = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider')
  }
  return context
}