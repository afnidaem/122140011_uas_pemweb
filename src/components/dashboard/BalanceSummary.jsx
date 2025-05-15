import React from 'react';
import Card from '../../components/common/Card';

const BalanceSummary = ({ totalBalance, totalIncome, totalExpense }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Balance',
      amount: totalBalance,
      color: 'bg-primary-600',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      title: 'Total Income',
      amount: totalIncome,
      color: 'bg-success',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: 'Total Expense',
      amount: totalExpense,
      color: 'bg-danger',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="flex-1">
          <Card className="h-full">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-full mr-4 text-white`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-secondary-500 font-medium">{card.title}</h3>
                <p className={`text-2xl font-bold ${card.amount < 0 ? 'text-danger' : 'text-secondary-900'}`}>
                  {formatCurrency(card.amount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default BalanceSummary;