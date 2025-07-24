// src/components/Orders/BudgetCalculator.js
import React, { useState, useMemo } from 'react';
import { Calculator, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const BudgetCalculator = ({ order, onSendToInventory }) => {
  const [calculations, setCalculations] = useState({
    siteCosts: order?.estimatedCosts?.siteCosts || 0,
    articleFees: order?.estimatedCosts?.articleFees || 0,
    profitTarget: order?.companyProfitTarget || 60
  });

  const calculatedBudget = useMemo(() => {
    if (!order) return { totalCost: 0, profit: 0, profitMargin: 0, isViable: false };
    
    const totalCost = calculations.siteCosts + calculations.articleFees;
    const profit = order.clientBudget - totalCost;
    const profitMargin = (profit / order.clientBudget) * 100;
    const maxBudgetForSites = (order.clientBudget * (100 - calculations.profitTarget)) / 100 - calculations.articleFees;
    
    return {
      totalCost,
      profit,
      profitMargin: profitMargin.toFixed(1),
      maxBudgetForSites: maxBudgetForSites.toFixed(0),
      isViable: profitMargin >= calculations.profitTarget
    };
  }, [calculations, order]);

  if (!order) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-400" />
        Budget Calculator - {order.id}
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Client Budget
            </label>
            <div className="bg-slate-700 p-3 rounded-lg">
              <span className="text-xl font-bold text-green-400">${order.clientBudget}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Site Costs
            </label>
            <input
              type="number"
              value={calculations.siteCosts}
              onChange={(e) => setCalculations(prev => ({...prev, siteCosts: Number(e.target.value)}))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Article Fees
            </label>
            <input
              type="number"
              value={calculations.articleFees}
              onChange={(e) => setCalculations(prev => ({...prev, articleFees: Number(e.target.value)}))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-slate-300 mb-3">Budget Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cost:</span>
                <span className="text-white">${calculatedBudget.totalCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit:</span>
                <span className={calculatedBudget.profit > 0 ? 'text-green-400' : 'text-red-400'}>
                  ${calculatedBudget.profit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit Margin:</span>
                <span className={calculatedBudget.profitMargin >= calculations.profitTarget ? 'text-green-400' : 'text-red-400'}>
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
          
          <button 
            onClick={() => onSendToInventory && onSendToInventory(order)}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Send to Inventory Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator;