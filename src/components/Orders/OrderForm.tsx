'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, Minus, Search, Calculator, Target, 
  DollarSign, User, Mail, Tag, Clock, 
  CheckCircle, AlertCircle, ArrowRight,
  Filter, Globe, TrendingUp, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SiteEntry {
  id: string
  siteName: string
  keyword: string
  clientLink: string
  sitePrice: number
  articleFee: number
  selectedInventoryId?: string
}

interface OrderFormData {
  clientName: string
  email: string
  tag: string
  orderCount: string
  sites: SiteEntry[]
  totalBudget: number
  profitMargin: number
}

const OrderForm: React.FC = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    clientName: '',
    email: '',
    tag: '',
    orderCount: '',
    sites: [],
    totalBudget: 0,
    profitMargin: 60
  })

  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [selectedSiteIndex, setSelectedSiteIndex] = useState<number | null>(null)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventory, setInventory] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClientComponentClient()
  const router = useRouter()

  // Initialize with one site entry
  useEffect(() => {
    if (formData.sites.length === 0) {
      addSiteEntry()
    }
  }, [])

  // Fetch inventory for site selection
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('web_inventory')
        .select('*')
        .eq('status', 'available')
      
      if (error) throw error
      setInventory(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const addSiteEntry = () => {
    const newSite: SiteEntry = {
      id: `site-${Date.now()}`,
      siteName: '',
      keyword: '',
      clientLink: '',
      sitePrice: 0,
      articleFee: 0
    }
    setFormData(prev => ({
      ...prev,
      sites: [...prev.sites, newSite]
    }))
  }

  const removeSiteEntry = (index: number) => {
    if (formData.sites.length > 1) {
      setFormData(prev => ({
        ...prev,
        sites: prev.sites.filter((_, i) => i !== index)
      }))
    }
  }

  const updateSiteEntry = (index: number, field: keyof SiteEntry, value: any) => {
    setFormData(prev => ({
      ...prev,
      sites: prev.sites.map((site, i) => 
        i === index ? { ...site, [field]: value } : site
      )
    }))
  }

  const selectInventoryForSite = (inventoryItem: any) => {
    if (selectedSiteIndex !== null) {
      updateSiteEntry(selectedSiteIndex, 'siteName', inventoryItem.domain)
      updateSiteEntry(selectedSiteIndex, 'sitePrice', inventoryItem.guest_post_price || 0)
      updateSiteEntry(selectedSiteIndex, 'articleFee', inventoryItem.article_fee || 0)
      updateSiteEntry(selectedSiteIndex, 'selectedInventoryId', inventoryItem.id)
      setShowInventoryModal(false)
      setSelectedSiteIndex(null)
    }
  }

  // Budget calculations
  const budgetCalculations = useMemo(() => {
    const totalSiteCosts = formData.sites.reduce((sum, site) => sum + (site.sitePrice || 0), 0)
    const totalArticleFees = formData.sites.reduce((sum, site) => sum + (site.articleFee || 0), 0)
    const totalCosts = totalSiteCosts + totalArticleFees
    const availableBudget = formData.totalBudget * (1 - formData.profitMargin / 100)
    const profit = formData.totalBudget - totalCosts
    const profitMargin = formData.totalBudget > 0 ? (profit / formData.totalBudget) * 100 : 0
    const isWithinBudget = totalCosts <= availableBudget
    const remainingBudget = availableBudget - totalCosts

    return {
      totalSiteCosts,
      totalArticleFees,
      totalCosts,
      availableBudget,
      profit,
      profitMargin,
      isWithinBudget,
      remainingBudget
    }
  }, [formData.sites, formData.totalBudget, formData.profitMargin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!budgetCalculations.isWithinBudget) {
      alert('Order exceeds available budget. Please adjust site selection or increase budget.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order')
      }

      alert(`Order ${result.orderId} created successfully!`)
      router.push('/?tab=orders')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error creating order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.domain?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category?.toLowerCase().includes(inventorySearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Order</h1>
          <p className="text-slate-400">Enter order details and select sites from inventory</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Client Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Client Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))}
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                />
              </div>
            </div>
          </div>

          {/* Budget Configuration */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-400" />
              Budget Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Total Budget</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.totalBudget || ''}
                  onChange={(e) => setFormData(prev => ({...prev, totalBudget: Number(e.target.value)}))}
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Company Profit Margin (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.profitMargin}
                  onChange={(e) => setFormData(prev => ({...prev, profitMargin: Number(e.target.value)}))}
                />
              </div>
            </div>
            
            {/* Budget Summary */}
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Available Budget:</span>
                  <div className="text-green-400 font-semibold">${budgetCalculations.availableBudget.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Current Costs:</span>
                  <div className="text-white font-semibold">${budgetCalculations.totalCosts.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Remaining:</span>
                  <div className={`font-semibold ${budgetCalculations.remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${budgetCalculations.remainingBudget.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Profit Margin:</span>
                  <div className={`font-semibold ${budgetCalculations.profitMargin >= formData.profitMargin ? 'text-green-400' : 'text-red-400'}`}>
                    {budgetCalculations.profitMargin.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Site Selection */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Site Selection
              </h2>
              <Button
                type="button"
                onClick={addSiteEntry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Site
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.sites.map((site, index) => (
                <div key={site.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Site {index + 1}</h3>
                    {formData.sites.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSiteEntry(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Site Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={site.siteName}
                          onChange={(e) => updateSiteEntry(index, 'siteName', e.target.value)}
                          placeholder="Search & pick from inventory"
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedSiteIndex(index)
                            setShowInventoryModal(true)
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Keyword</label>
                      <input
                        type="text"
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={site.keyword}
                        onChange={(e) => updateSiteEntry(index, 'keyword', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Site Price</label>
                      <input
                        type="number"
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={site.sitePrice || ''}
                        onChange={(e) => updateSiteEntry(index, 'sitePrice', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Article Fee</label>
                      <input
                        type="number"
                        className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={site.articleFee || ''}
                        onChange={(e) => updateSiteEntry(index, 'articleFee', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={!budgetCalculations.isWithinBudget || isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold text-lg flex items-center gap-3 ${
                budgetCalculations.isWithinBudget && !isSubmitting
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Order...
                </>
              ) : budgetCalculations.isWithinBudget ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Create Order
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Budget Exceeded
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Inventory Modal */}
        {showInventoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Select from Inventory</h3>
                  <Button 
                    onClick={() => setShowInventoryModal(false)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid gap-4">
                  {filteredInventory.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 cursor-pointer transition-colors"
                      onClick={() => selectInventoryForSite(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{item.domain}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-300">
                            <span>DA: {item.domain_authority}</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">${item.guest_post_price || 0}</div>
                          <div className="text-slate-400 text-sm">+${item.article_fee || 0} article</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderForm