'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Plus, Minus, Search, Calculator, Target, 
  DollarSign, User, Mail, Tag, Clock, 
  CheckCircle, AlertCircle, ArrowRight,
  X, Globe, Package
} from 'lucide-react'
import '../../styles/NewOrderModal.css'

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

interface NewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onOrderCreated: () => void
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onOrderCreated }) => {
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

  // Initialize with one site entry when modal opens
  useEffect(() => {
    if (isOpen && formData.sites.length === 0) {
      addSiteEntry()
    }
  }, [isOpen])

  // Fetch inventory for site selection
  useEffect(() => {
    if (isOpen) {
      fetchInventory()
    }
  }, [isOpen])

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

      // Reset form
      setFormData({
        clientName: '',
        email: '',
        tag: '',
        orderCount: '',
        sites: [],
        totalBudget: 0,
        profitMargin: 60
      })

      onOrderCreated()
      onClose()
      
      alert(`Order ${result.orderId} created successfully!`)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error creating order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.domain?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.category?.toLowerCase().includes(inventorySearch.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <>
      <div className="new-order-modal-overlay" onClick={handleClose}>
        <div className="new-order-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="new-order-modal-header">
            <h2 className="new-order-modal-title">
              <Plus className="new-order-modal-title-icon" />
              Create New Order
            </h2>
            <button className="new-order-modal-close" onClick={handleClose}>
              <X className="new-order-modal-close-icon" />
            </button>
          </div>

          {/* Body */}
          <div className="new-order-modal-body">
            <div className="new-order-form-container">
              <form onSubmit={handleSubmit}>
                {/* Client Information */}
                <div className="new-order-form-section">
                  <h3 className="new-order-section-title">
                    <User className="new-order-section-icon client" />
                    Client Information
                  </h3>
                  
                  <div className="new-order-form-grid">
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">
                        Client Name <span className="new-order-form-label-required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="new-order-form-input"
                        placeholder="Enter client name"
                        value={formData.clientName}
                        onChange={(e) => setFormData(prev => ({...prev, clientName: e.target.value}))}
                      />
                    </div>
                    
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">
                        Email Address <span className="new-order-form-label-required">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        className="new-order-form-input"
                        placeholder="client@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      />
                    </div>
                    
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">Tag</label>
                      <input
                        type="text"
                        className="new-order-form-input"
                        placeholder="Project tag"
                        value={formData.tag}
                        onChange={(e) => setFormData(prev => ({...prev, tag: e.target.value}))}
                      />
                    </div>
                    
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">Order Count</label>
                      <input
                        type="text"
                        className="new-order-form-input"
                        placeholder="e.g., 1st time, recurring"
                        value={formData.orderCount}
                        onChange={(e) => setFormData(prev => ({...prev, orderCount: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {/* Budget Configuration */}
                <div className="new-order-form-section">
                  <h3 className="new-order-section-title">
                    <Calculator className="new-order-section-icon budget" />
                    Budget Configuration
                  </h3>
                  
                  <div className="new-order-form-grid two-col">
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">
                        Total Budget <span className="new-order-form-label-required">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        className="new-order-form-input"
                        placeholder="0"
                        value={formData.totalBudget || ''}
                        onChange={(e) => setFormData(prev => ({...prev, totalBudget: Number(e.target.value)}))}
                      />
                    </div>
                    
                    <div className="new-order-form-group">
                      <label className="new-order-form-label">Company Profit Margin (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="new-order-form-input"
                        value={formData.profitMargin}
                        onChange={(e) => setFormData(prev => ({...prev, profitMargin: Number(e.target.value)}))}
                      />
                    </div>
                  </div>
                  
                  {/* Budget Summary */}
                  <div className="new-order-budget-summary">
                    <div className="new-order-budget-grid">
                      <div className="new-order-budget-item">
                        <div className="new-order-budget-label">Available Budget</div>
                        <div className="new-order-budget-value positive">
                          ${budgetCalculations.availableBudget.toFixed(2)}
                        </div>
                      </div>
                      <div className="new-order-budget-item">
                        <div className="new-order-budget-label">Current Costs</div>
                        <div className="new-order-budget-value neutral">
                          ${budgetCalculations.totalCosts.toFixed(2)}
                        </div>
                      </div>
                      <div className="new-order-budget-item">
                        <div className="new-order-budget-label">Remaining</div>
                        <div className={`new-order-budget-value ${budgetCalculations.remainingBudget >= 0 ? 'positive' : 'negative'}`}>
                          ${budgetCalculations.remainingBudget.toFixed(2)}
                        </div>
                      </div>
                      <div className="new-order-budget-item">
                        <div className="new-order-budget-label">Profit Margin</div>
                        <div className={`new-order-budget-value ${budgetCalculations.profitMargin >= formData.profitMargin ? 'positive' : 'negative'}`}>
                          {budgetCalculations.profitMargin.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Site Selection */}
                <div className="new-order-form-section">
                  <h3 className="new-order-section-title">
                    <Globe className="new-order-section-icon sites" />
                    Site Selection ({formData.sites.length})
                  </h3>
                  
                  {formData.sites.map((site, index) => (
                    <div key={site.id} className="new-order-site-entry">
                      <div className="new-order-site-header">
                        <h4 className="new-order-site-title">Site {index + 1}</h4>
                        {formData.sites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSiteEntry(index)}
                            className="new-order-site-remove"
                          >
                            <Minus size={18} />
                          </button>
                        )}
                      </div>
                      
                      <div className="new-order-site-fields">
                        <div className="new-order-form-grid">
                          <div className="new-order-form-group">
                            <label className="new-order-form-label">Site Name</label>
                            <div className="new-order-site-search-group">
                              <input
                                type="text"
                                className="new-order-site-search-input"
                                placeholder="Search & select from inventory"
                                value={site.siteName}
                                onChange={(e) => updateSiteEntry(index, 'siteName', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSiteIndex(index)
                                  setShowInventoryModal(true)
                                }}
                                className="new-order-site-search-btn"
                              >
                                <Search size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="new-order-form-group">
                            <label className="new-order-form-label">Keyword</label>
                            <input
                              type="text"
                              className="new-order-form-input"
                              placeholder="Target keyword"
                              value={site.keyword}
                              onChange={(e) => updateSiteEntry(index, 'keyword', e.target.value)}
                            />
                          </div>
                          
                          <div className="new-order-form-group">
                            <label className="new-order-form-label">Client Link</label>
                            <input
                              type="url"
                              className="new-order-form-input"
                              placeholder="https://client-website.com"
                              value={site.clientLink}
                              onChange={(e) => updateSiteEntry(index, 'clientLink', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="new-order-site-price-fields">
                          <div className="new-order-form-group">
                            <label className="new-order-form-label">Site Price</label>
                            <input
                              type="number"
                              className="new-order-form-input"
                              placeholder="0"
                              value={site.sitePrice || ''}
                              onChange={(e) => updateSiteEntry(index, 'sitePrice', Number(e.target.value))}
                            />
                          </div>
                          
                          <div className="new-order-form-group">
                            <label className="new-order-form-label">Article Fee</label>
                            <input
                              type="number"
                              className="new-order-form-input"
                              placeholder="0"
                              value={site.articleFee || ''}
                              onChange={(e) => updateSiteEntry(index, 'articleFee', Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSiteEntry}
                    className="new-order-add-site"
                  >
                    <Plus size={18} />
                    Add Another Site
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="new-order-submit-section">
            <div className="new-order-submit-info">
              Total Sites: {formData.sites.length} • Total Cost: ${budgetCalculations.totalCosts.toFixed(2)}
            </div>
            <div className="new-order-submit-actions">
              <button
                type="button"
                onClick={handleClose}
                className="new-order-btn new-order-btn-cancel"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!budgetCalculations.isWithinBudget || isSubmitting}
                className={`new-order-btn ${
                  isSubmitting 
                    ? 'new-order-btn-loading' 
                    : budgetCalculations.isWithinBudget 
                    ? 'new-order-btn-submit' 
                    : 'new-order-btn-submit'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="new-order-loading-spinner"></div>
                    Creating...
                  </>
                ) : budgetCalculations.isWithinBudget ? (
                  <>
                    <CheckCircle size={18} />
                    Create Order
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} />
                    Budget Exceeded
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Selection Modal */}
      {showInventoryModal && (
        <div className="new-order-modal-overlay" onClick={() => setShowInventoryModal(false)}>
          <div className="new-order-inventory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="new-order-inventory-header">
              <h3 className="new-order-inventory-title">Select from Inventory</h3>
              <button 
                onClick={() => setShowInventoryModal(false)}
                className="new-order-modal-close"
              >
                <X className="new-order-modal-close-icon" />
              </button>
            </div>
            
            <div className="new-order-inventory-body">
              <div className="new-order-inventory-search">
                <Search className="new-order-inventory-search-icon" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="new-order-inventory-search-input"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                />
              </div>
              
              <div className="new-order-inventory-list">
                {filteredInventory.map((item) => (
                  <div 
                    key={item.id}
                    className="new-order-inventory-item"
                    onClick={() => selectInventoryForSite(item)}
                  >
                    <div className="new-order-inventory-item-content">
                      <div className="new-order-inventory-item-info">
                        <h4>{item.domain}</h4>
                        <div className="new-order-inventory-item-meta">
                          <span>DA: {item.domain_authority}</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                      <div className="new-order-inventory-item-price">
                        <div className="new-order-inventory-item-price-main">
                          ${item.guest_post_price || 0}
                        </div>
                        <div className="new-order-inventory-item-price-sub">
                          +${item.article_fee || 0} article
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredInventory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No inventory items found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NewOrderModal