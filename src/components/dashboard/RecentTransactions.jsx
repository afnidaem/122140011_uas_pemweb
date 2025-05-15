import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { useWallet } from '../../context/WalletContext';
import { useTransaction } from '../../context/TransactionContext';

const RecentTransactions = ({ transactions }) => {
  const { wallets } = useWallet();
  const { getCategoryById } = useTransaction();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  const getWalletName = (walletId) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown Wallet';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'income':
        return 'text-success';
      case 'expense':
        return 'text-danger';
      case 'transfer':
        return 'text-info';
      default:
        return 'text-secondary-700';
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case 'income':
        return '+';
      case 'expense':
        return '-';
      default:
        return '';
    }
  };

  const getTransactionDescription = (transaction) => {
    const { type, category, walletId, toWalletId } = transaction;
    const categoryInfo = getCategoryById(type, category);
    
    if (type === 'transfer' && toWalletId) {
      return `Transfer from ${getWalletName(walletId)} to ${getWalletName(toWalletId)}`;
    }
    
    return categoryInfo ? `${categoryInfo.icon} ${categoryInfo.name}` : category;
  };

  return (
    <Card 
      title="Recent Transactions" 
      footer={
        <div className="text-center">
          <Link 
            to="/transactions" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Transactions
          </Link>
        </div>
      }
    >
      {transactions.length === 0 ? (
        <p className="text-secondary-600 text-center py-4">No transactions yet.</p>
      ) : (
        <div className="divide-y divide-secondary-200">
          {transactions.map(transaction => (
            <div key={transaction.id} className="py-3 hover:bg-secondary-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      {getCategoryById(transaction.type, transaction.category)?.icon || '?'}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-secondary-800">
                      {getTransactionDescription(transaction)}
                    </p>
                    <div className="text-xs text-secondary-500 mt-1">
                      <span>{formatDate(transaction.date)}</span>
                      <span className="mx-1">•</span>
                      <span>{getWalletName(transaction.walletId)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`font-semibold ${getTypeColor(transaction.type)}`}>
                  {transaction.type !== 'transfer' && getAmountPrefix(transaction.type)}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              
              {transaction.note && (
                <div className="pl-13 mt-1">
                  <p className="text-sm text-secondary-500 ml-11">{transaction.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;