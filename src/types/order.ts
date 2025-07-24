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

export interface OrderRequirements {
  categories: string[]
  minDA: number
  linkType: string
  niche: string
}

export interface OrderCosts {
  siteCosts: number
  articleFees: number
  totalCost: number
  profit: number
  profitMargin: number
}

export type OrderStatus = 'Draft' | 'In Progress' | 'Budget Analysis' | 'Inventory Selection' | 'Completed' | 'On Hold' | 'Cancelled'