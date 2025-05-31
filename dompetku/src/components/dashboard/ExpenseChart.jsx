import React, { useEffect, useState } from 'react';
import Card from '../common/Card';
import { useTransaction } from '../../context/TransactionContext';

const ExpenseChart = ({ transactions }) => {
  const { categories } = useTransaction();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Group expenses by category
      const expensesMap = new Map();
      
      // Initialize with all expense categories
      categories.expense.forEach(category => {
        expensesMap.set(category.id, {
          id: category.id,
          name: category.name,
          icon: category.icon,
          amount: 0,
        });
      });
      
      // Sum up amounts by category
      transactions.forEach(transaction => {
        if (transaction.type === 'expense' && expensesMap.has(transaction.category)) {
          const category = expensesMap.get(transaction.category);
          category.amount += transaction.amount;
        }
      });
      
      // Convert to array and sort by amount descending
      const sortedData = Array.from(expensesMap.values())
        .filter(category => category.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      
      setChartData(sortedData);
    }
  }, [transactions, categories]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalExpense = chartData.reduce((sum, category) => sum + category.amount, 0);

  return (
    <Card title="Expense By Category">
      {chartData.length === 0 ? (
        <p className="text-secondary-600 text-center py-4">No expense data yet.</p>
      ) : (
        <div className="space-y-3">
          {chartData.map((category) => {
            const percentage = totalExpense > 0 ? (category.amount / totalExpense) * 100 : 0;
            
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    <span className="mr-2">{category.icon}</span>
                    <span className="text-sm font-medium text-secondary-700">{category.name}</span>
                  </div>
                  <div className="text-sm text-secondary-900">
                    <span className="font-semibold">{formatCurrency(category.amount)}</span>
                    <span className="text-secondary-500 ml-1">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ExpenseChart;