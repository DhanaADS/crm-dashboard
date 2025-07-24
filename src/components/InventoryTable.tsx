import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, 
  Edit, Trash2, ExternalLink, TrendingUp, TrendingDown, Eye, Download,
  ShoppingCart, DollarSign, Target, CheckCircle, AlertCircle, X,
  Calculator, Globe, Package
} from 'lucide-react';
import './InventoryTable.css'; // Import the CSS file

const InventoryManagement = () => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrderSelection, setShowOrderSelection] = useState(false);

  // Sample active orders for integration
  const activeOrders = [
    {
      id: 'ORD-001',
      clientName: 'TechCorp Solutions',
      sitesNeeded: 3,
      maxBudget: 240,
      requirements: {
        categories: ['Technology', 'Business'],
        minDA: 80,
        linkType: 'Editorial'
      }
    },
    {
      id: 'ORD-002',
      clientName: 'HealthPro Inc',
      sitesNeeded: 5,
      maxBudget: 400,
      requirements: {
        categories: ['Health', 'Medical'],
        minDA: 75,
        linkType: 'Guest Post'
      }
    }
  ];

  // Enhanced inventory data with pricing and availability
  const inventoryData = [
    {
      id: 1,
      domain: 'techcrunch.com',
      category: 'Technology',
      domainAuthority: 92,
      monthlyTraffic: '45.2M',
      trafficTrend: 'up',
      linkType: 'Editorial',
      status: 'Available',
      lastUpdated: '2025-01-20',
      pricing: {
        editorial: 120,
        guestPost: 80,
        sponsored: 150
      },
      articleFee: 20,
      turnaroundDays: 5,
      notes: 'High-quality tech publication'
    },
    {
      id: 2,
      domain: 'forbes.com',
      category: 'Business',
      domainAuthority: 94,
      monthlyTraffic: '88.1M',
      trafficTrend: 'up',
      linkType: 'Sponsored',
      status: 'Available',
      lastUpdated: '2025-01-19',
      pricing: {
        editorial: 200,
        guestPost: 120,
        sponsored: 180
      },
      articleFee: 30,
      turnaroundDays: 7,
      notes: 'Premium business content'
    },
    {
      id: 3,
      domain: 'healthline.com',
      category: 'Health',
      domainAuthority: 89,
      monthlyTraffic: '67.5M',
      trafficTrend: 'down',
      linkType: 'Guest Post',
      status: 'Available',
      lastUpdated: '2025-01-18',
      pricing: {
        editorial: 100,
        guestPost: 70,
        sponsored: 110
      },
      articleFee: 15,
      turnaroundDays: 4,
      notes: 'Medical authority site'
    },
    {
      id: 4,
      domain: 'investopedia.com',
      category: 'Finance',
      domainAuthority: 87,
      monthlyTraffic: '34.7M',
      trafficTrend: 'up',
      linkType: 'Resource',
      status: 'Available',
      lastUpdated: '2025-01-17',
      pricing: {
        editorial: 90,
        guestPost: 60,
        sponsored: 100
      },
      articleFee: 20,
      turnaroundDays: 6,
      notes: 'Financial education leader'
    },
    {
      id: 5,
      domain: 'coursera.org',
      category: 'Education',
      domainAuthority: 85,
      monthlyTraffic: '89.3M',
      trafficTrend: 'up',
      linkType: 'Partnership',
      status: 'Available',
      lastUpdated: '2025-01-16',
      pricing: {
        editorial: 80,
        guestPost: 50,
        sponsored: 90
      },
      articleFee: 15,
      turnaroundDays: 3,
      notes: 'Online learning platform'
    },
    {
      id: 6,
      domain: 'wired.com',
      category: 'Technology',
      domainAuthority: 91,
      monthlyTraffic: '28.4M',
      trafficTrend: 'down',
      linkType: 'Editorial',
      status: 'Limited',
      lastUpdated: '2025-01-15',
      pricing: {
        editorial: 110,
        guestPost: 75,
        sponsored: 130
      },
      articleFee: 25,
      turnaroundDays: 5,
      notes: 'Tech culture and news'
    },
    {
      id: 7,
      domain: 'entrepreneur.com',
      category: 'Business',
      domainAuthority: 83,
      monthlyTraffic: '15.6M',
      trafficTrend: 'up',
      linkType: 'Guest Post',
      status: 'Available',
      lastUpdated: '2025-01-14',
      pricing: {
        editorial: 70,
        guestPost: 45,
        sponsored: 80
      },
      articleFee: 12,
      turnaroundDays: 4,
      notes: 'Entrepreneurship focused'
    },
    {
      id: 8,
      domain: 'webmd.com',
      category: 'Health',
      domainAuthority: 88,
      monthlyTraffic: '52.1M',
      trafficTrend: 'up',
      linkType: 'Resource',
      status: 'Available',
      lastUpdated: '2025-01-13',
      pricing: {
        editorial: 95,
        guestPost: 65,
        sponsored: 105
      },
      articleFee: 18,
      turnaroundDays: 5,
      notes: 'Medical information portal'
    }
  ];

  const filteredData = useMemo(() => {
    let filtered = inventoryData.filter(item =>
      item.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.linkType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply order-based filtering if an order is selected
    if (activeOrder) {
      filtered = filtered.filter(item => {
        const meetsDA = item.domainAuthority >= activeOrder.requirements.minDA;
        const meetsCategory = activeOrder.requirements.categories.includes(item.category);
        return meetsDA && meetsCategory;
      });
    }

    return filtered;
  }, [searchTerm, activeOrder]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === 'domainAuthority') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const selectedItemsData = useMemo(() => {
    return inventoryData.filter(item => selectedItems.has(item.id));
  }, [selectedItems]);

  const budgetCalculation = useMemo(() => {
    if (!activeOrder || selectedItemsData.length === 0) {
      return { total: 0, articleFees: 0, grandTotal: 0, isWithinBudget: true };
    }

    const linkTypeKey = activeOrder.requirements.linkType.toLowerCase().replace(' ', '');
    const linkTypePricing = {
      'editorial': 'editorial',
      'guestpost': 'guestPost',
      'sponsored': 'sponsored',
      'resourcepage': 'guestPost',
      'partnership': 'guestPost'
    };

    const pricingKey = linkTypePricing[linkTypeKey] || 'guestPost';

    const total = selectedItemsData.reduce((sum, item) => {
      return sum + (item.pricing[pricingKey] || item.pricing.guestPost);
    }, 0);

    const articleFees = selectedItemsData.reduce((sum, item) => sum + item.articleFee, 0);
    const grandTotal = total + articleFees;
    const isWithinBudget = grandTotal <= activeOrder.maxBudget;

    return { total, articleFees, grandTotal, isWithinBudget };
  }, [selectedItemsData, activeOrder]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="sort-icon" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="sort-icon active" /> : 
      <ArrowDown className="sort-icon active" />;
  };

  const getStatusBadge = (status) => {
    const statusClass = status.toLowerCase().replace(' ', '-');
    return (
      <span className={`status-badge status-${statusClass}`}>
        {status}
      </span>
    );
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 
      <TrendingUp className="trend-icon trend-up" /> : 
      <TrendingDown className="trend-icon trend-down" />;
  };

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      // Check if we can add more items based on order requirements
      if (activeOrder && selectedItems.size >= activeOrder.sitesNeeded && !newSelected.has(id)) {
        return; // Don't allow selecting more than needed
      }
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const getPriceForLinkType = (item, linkType) => {
    const linkTypeKey = linkType?.toLowerCase().replace(' ', '');
    const linkTypePricing = {
      'editorial': 'editorial',
      'guestpost': 'guestPost',
      'sponsored': 'sponsored',
      'resourcepage': 'guestPost',
      'partnership': 'guestPost'
    };
    
    const pricingKey = linkTypePricing[linkTypeKey] || 'guestPost';
    return item.pricing[pricingKey] || item.pricing.guestPost;
  };

  const OrderSelectionPanel = () => (
    <div className="order-panel">
      <div className="order-panel-header">
        <h3 className="order-panel-title">
          <Target className="w-5 h-5 text-blue-400" />
          Order-Based Filtering
        </h3>
        {activeOrder && (
          <button 
            onClick={() => {
              setActiveOrder(null);
              setSelectedItems(new Set());
            }}
            className="btn btn-danger"
          >
            <X className="w-4 h-4" />
            Clear Order
          </button>
        )}
      </div>
      
      {!activeOrder ? (
        <div className="order-grid">
          {activeOrders.map(order => (
            <div 
              key={order.id} 
              className="order-card"
              onClick={() => setActiveOrder(order)}
            >
              <div className="order-card-header">
                <span className="order-id">{order.id}</span>
                <span className="order-sites">{order.sitesNeeded} sites</span>
              </div>
              <div className="order-client">{order.clientName}</div>
              <div className="order-details">
                <div>Budget: ${order.maxBudget}</div>
                <div>Min DA: {order.requirements.minDA}</div>
                <div>Categories: {order.requirements.categories.join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="active-order-summary">
          <div className="order-info">
            <h4>Active Order: {activeOrder.id}</h4>
            <div className="info-item">
              <span className="info-label">Client:</span>
              <span className="info-value">{activeOrder.clientName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Sites Needed:</span>
              <span className="info-value">{activeOrder.sitesNeeded}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Budget:</span>
              <span className="info-value success">${activeOrder.maxBudget}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Link Type:</span>
              <span className="info-value">{activeOrder.requirements.linkType}</span>
            </div>
          </div>
          <div className="selection-status">
            <h4>Selection Status</h4>
            <div className="info-item">
              <span className="info-label">Selected:</span>
              <span className="info-value">{selectedItems.size}/{activeOrder.sitesNeeded}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Budget Used:</span>
              <span className={`info-value ${budgetCalculation.isWithinBudget ? 'success' : 'danger'}`}>
                ${budgetCalculation.grandTotal}/${activeOrder.maxBudget}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Remaining:</span>
              <span className="info-value info">
                ${activeOrder.maxBudget - budgetCalculation.grandTotal}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const BudgetSummary = () => {
    if (!activeOrder || selectedItems.size === 0) return null;

    const summaryClass = budgetCalculation.isWithinBudget && selectedItems.size === activeOrder.sitesNeeded
      ? 'budget-summary success' 
      : selectedItems.size > activeOrder.sitesNeeded || !budgetCalculation.isWithinBudget
      ? 'budget-summary danger'
      : 'budget-summary warning';

    return (
      <div className={summaryClass}>
        <div className="budget-header">
          <div className="budget-title">
            {budgetCalculation.isWithinBudget && selectedItems.size === activeOrder.sitesNeeded ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            Budget Summary - {activeOrder.id}
          </div>
          <div className="budget-breakdown">
            <div>Sites: ${budgetCalculation.total} | Articles: ${budgetCalculation.articleFees}</div>
            <div className="budget-total">Total: ${budgetCalculation.grandTotal}</div>
          </div>
        </div>
        
        {selectedItems.size === activeOrder.sitesNeeded && budgetCalculation.isWithinBudget && (
          <div className="budget-actions">
            <button className="btn btn-success">
              Finalize Selection for {activeOrder.id}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inventory-container">
      <div className="inventory-wrapper">
        {/* Header */}
        <div className="inventory-header">
          <div>
            <h2 className="inventory-title">Domain Inventory</h2>
            <p className="inventory-subtitle">
              {filteredData.length} domains available
              {activeOrder && ` • Filtered for ${activeOrder.id}`}
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowOrderSelection(!showOrderSelection)}
              className="btn btn-primary"
            >
              <Target className="w-4 h-4" />
              {activeOrder ? 'Change Order' : 'Select Order'}
            </button>
            <button className="btn btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Order Selection Panel */}
        <OrderSelectionPanel />

        {/* Budget Summary */}
        <BudgetSummary />

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-controls">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead className="table-header">
              <tr>
                <th className="table-cell">
                  <span>Select</span>
                </th>
                <th 
                  className="table-cell sortable-header"
                  onClick={() => handleSort('domain')}
                >
                  <button className="sort-button">
                    Domain
                    {getSortIcon('domain')}
                  </button>
                </th>
                <th 
                  className="table-cell sortable-header"
                  onClick={() => handleSort('category')}
                >
                  <button className="sort-button">
                    Category
                    {getSortIcon('category')}
                  </button>
                </th>
                <th 
                  className="table-cell sortable-header"
                  onClick={() => handleSort('domainAuthority')}
                >
                  <button className="sort-button">
                    DA Score
                    {getSortIcon('domainAuthority')}
                  </button>
                </th>
                <th className="table-cell">Traffic</th>
                <th className="table-cell">Pricing</th>
                <th className="table-cell">Article Fee</th>
                <th className="table-cell">Status</th>
                <th className="table-cell">Turnaround</th>
                <th className="table-cell" style={{textAlign: 'center'}}>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {sortedData.map((item) => {
                const isSelected = selectedItems.has(item.id);
                const currentPrice = activeOrder ? 
                  getPriceForLinkType(item, activeOrder.requirements.linkType) : 
                  item.pricing.guestPost;
                
                return (
                  <tr 
                    key={item.id} 
                    className={`table-row ${isSelected ? 'selected' : ''}`}
                  >
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        disabled={activeOrder && selectedItems.size >= activeOrder.sitesNeeded && !isSelected}
                        className="checkbox"
                      />
                    </td>
                    <td className="table-cell domain-cell">
                      <div>
                        <a href={`https://${item.domain}`} className="domain-link" target="_blank" rel="noopener noreferrer">
                          {item.domain}
                          <ExternalLink className="external-icon" />
                        </a>
                        {item.notes && (
                          <div className="domain-notes">{item.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td className="table-cell">
                      <div className="da-score">
                        <div className="da-indicator"></div>
                        <span className="da-value">{item.domainAuthority}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="traffic-cell">
                        <span className="traffic-value">{item.monthlyTraffic}</span>
                        {getTrendIcon(item.trafficTrend)}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="pricing-display">
                        {activeOrder ? (
                          <span className="pricing-current">${currentPrice}</span>
                        ) : (
                          <div className="pricing-breakdown">
                            <div className="pricing-item">E: ${item.pricing.editorial}</div>
                            <div className="pricing-item">G: ${item.pricing.guestPost}</div>
                            <div className="pricing-item">S: ${item.pricing.sponsored}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="article-fee">${item.articleFee}</span>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="table-cell">
                      <span className="turnaround">{item.turnaroundDays} days</span>
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        <button className="action-btn" title="View">
                          <Eye className="action-icon" />
                        </button>
                        <button className="action-btn" title="Edit">
                          <Edit className="action-icon" />
                        </button>
                        <button className="action-btn" title="More">
                          <MoreHorizontal className="action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Table Footer */}
          <div className="table-footer">
            <div className="table-info">
              Showing 1 to <strong>{sortedData.length}</strong> of <strong>{sortedData.length}</strong> results
              {selectedItems.size > 0 && (
                <span> • <strong>{selectedItems.size}</strong> selected</span>
              )}
            </div>
            <div className="pagination">
              <button className="pagination-btn">
                Previous
              </button>
              <button className="pagination-btn active">
                1
              </button>
              <button className="pagination-btn">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;