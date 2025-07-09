import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '../ui/GlassmorphicCard';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: 'oz' | 'ml' | 'dash' | 'splash' | 'piece';
  costPerUnit: number;
}

interface CocktailCost {
  id: string;
  name: string;
  ingredients: Ingredient[];
  glassware: string;
  garnish?: string;
  garnishCost?: number;
  menuPrice: number;
  targetCostPercent: number;
}

export const PourCostCalculator: React.FC = () => {
  const [cocktails, setCocktails] = useState<CocktailCost[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<CocktailCost | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const calculateTotalCost = (cocktail: CocktailCost): number => {
    const ingredientCost = cocktail.ingredients.reduce((sum, ing) => {
      const unitCost = convertToOunces(ing.quantity, ing.unit) * ing.costPerUnit;
      return sum + unitCost;
    }, 0);
    
    return ingredientCost + (cocktail.garnishCost || 0);
  };

  const calculateMargin = (cocktail: CocktailCost): {
    cost: number;
    profit: number;
    margin: number;
    costPercent: number;
  } => {
    const cost = calculateTotalCost(cocktail);
    const profit = cocktail.menuPrice - cost;
    const margin = (profit / cocktail.menuPrice) * 100;
    const costPercent = (cost / cocktail.menuPrice) * 100;

    return { cost, profit, margin, costPercent };
  };

  const convertToOunces = (quantity: number, unit: string): number => {
    switch (unit) {
      case 'oz': return quantity;
      case 'ml': return quantity * 0.033814;
      case 'dash': return 0.03125; // 1/32 oz
      case 'splash': return 0.25;
      case 'piece': return 0; // For garnishes
      default: return quantity;
    }
  };

  const getMarginColor = (costPercent: number, target: number): string => {
    if (costPercent <= target) return '#27ae60'; // Green - good
    if (costPercent <= target * 1.1) return '#f39c12'; // Yellow - warning
    return '#e74c3c'; // Red - over target
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="pour-cost-calculator">
      <div className="calculator-header">
        <h2>Pour Cost & Margin Calculator</h2>
        <motion.button
          className="add-cocktail-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
        >
          + Add Cocktail
        </motion.button>
      </div>

      <div className="cost-summary">
        <GlassmorphicCard className="summary-card">
          <h3>Cost Performance Overview</h3>
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Average Cost %</span>
              <span className="metric-value">
                {cocktails.length > 0
                  ? (cocktails.reduce((sum, c) => sum + calculateMargin(c).costPercent, 0) / cocktails.length).toFixed(1)
                  : '0'}%
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Items Over Target</span>
              <span className="metric-value">
                {cocktails.filter(c => calculateMargin(c).costPercent > c.targetCostPercent).length}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Profit/Drink</span>
              <span className="metric-value">
                {formatCurrency(
                  cocktails.length > 0
                    ? cocktails.reduce((sum, c) => sum + calculateMargin(c).profit, 0) / cocktails.length
                    : 0
                )}
              </span>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      <div className="cocktails-grid">
        {cocktails.map((cocktail) => {
          const { cost, profit, margin, costPercent } = calculateMargin(cocktail);
          const marginColor = getMarginColor(costPercent, cocktail.targetCostPercent);

          return (
            <GlassmorphicCard key={cocktail.id} className="cocktail-cost-card">
              <div className="cocktail-header">
                <h3>{cocktail.name}</h3>
                <span className="menu-price">{formatCurrency(cocktail.menuPrice)}</span>
              </div>

              <div className="cost-breakdown">
                <div className="ingredients-list">
                  {cocktail.ingredients.map((ing) => (
                    <div key={ing.id} className="ingredient-row">
                      <span>{ing.quantity} {ing.unit} {ing.name}</span>
                      <span className="ingredient-cost">
                        {formatCurrency(convertToOunces(ing.quantity, ing.unit) * ing.costPerUnit)}
                      </span>
                    </div>
                  ))}
                  {cocktail.garnishCost && (
                    <div className="ingredient-row">
                      <span>Garnish: {cocktail.garnish}</span>
                      <span className="ingredient-cost">
                        {formatCurrency(cocktail.garnishCost)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cost-summary-row">
                  <span>Total Cost:</span>
                  <span className="total-cost">{formatCurrency(cost)}</span>
                </div>
              </div>

              <div className="margin-visualization">
                <div 
                  className="margin-bar"
                  style={{
                    background: `linear-gradient(to right, 
                      ${marginColor} 0%, 
                      ${marginColor} ${costPercent}%, 
                      #2c3e50 ${costPercent}%, 
                      #2c3e50 100%)`
                  }}
                />
                <div className="margin-labels">
                  <span>Cost: {costPercent.toFixed(1)}%</span>
                  <span>Profit: {margin.toFixed(1)}%</span>
                </div>
              </div>

              <div className="cost-metrics">
                <div className="metric-item">
                  <span>Target Cost:</span>
                  <span>{cocktail.targetCostPercent}%</span>
                </div>
                <div className="metric-item">
                  <span>Profit:</span>
                  <span style={{ color: marginColor }}>
                    {formatCurrency(profit)}
                  </span>
                </div>
              </div>

              <motion.button
                className="edit-btn"
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedCocktail(cocktail);
                  setIsEditing(true);
                }}
              >
                Edit Recipe & Cost
              </motion.button>
            </GlassmorphicCard>
          );
        })}
      </div>
    </div>
  );
};