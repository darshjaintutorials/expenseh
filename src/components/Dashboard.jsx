import React, { useState } from 'react';
import { LogOut, ArrowUpRight, ArrowDownRight, Edit2, Check, Trash2 } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import Visualizations from './Visualizations';

export default function Dashboard({ 
  onLogout, 
  transactions, 
  categories, 
  persons, 
  currentBalance, 
  startingBalance,
  setStartingBalance,
  addTransaction, 
  addCategory,
  deleteTransaction
}) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(startingBalance);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'deleted'

  const activeTransactions = transactions.filter(t => !t.is_deleted);
  const deletedTransactions = transactions.filter(t => t.is_deleted);
  
  const displayTransactions = activeTab === 'active' ? activeTransactions : deletedTransactions;

  const handleBalanceSave = () => {
    setStartingBalance(parseFloat(tempBalance) || 0);
    setIsEditingBalance(false);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="app-title">
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
            <ArrowUpRight size={24} />
          </div>
          <h1>Expense Tracker</h1>
        </div>
        <button onClick={onLogout} className="btn btn-secondary">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="dashboard-grid mb-6" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card glass flex justify-between items-center">
          <div>
            <h2 className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Current Balance</h2>
            <div className={`balance-amount ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              ₹{currentBalance.toFixed(2)}
            </div>
          </div>
          
          <div className="text-right">
            <h3 className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>Starting Balance</h3>
            {isEditingBalance ? (
              <div className="flex gap-2 items-center">
                <input 
                  type="number" 
                  className="form-input" 
                  style={{ width: '120px', padding: '0.5rem' }}
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                />
                <button onClick={handleBalanceSave} className="btn btn-primary" style={{ padding: '0.5rem' }}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center justify-end">
                <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>₹{startingBalance.toFixed(2)}</span>
                <button onClick={() => setIsEditingBalance(true)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="flex-col gap-6">
          <ExpenseForm 
            categories={categories} 
            persons={persons} 
            addTransaction={addTransaction}
            addCategory={addCategory}
          />
        </div>
        
        <div className="flex-col gap-6">
          <div className="mb-6">
            <Visualizations transactions={activeTransactions} />
          </div>
          
          <div className="card glass">
            <div className="card-header">
              <div className="flex justify-between items-center mb-4">
                <h3>Transactions Log</h3>
                <span className="badge">{displayTransactions.length} Total</span>
              </div>
              <div className="flex gap-2">
                <button 
                  className={`btn flex-1 ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('active')}
                  style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  Active
                </button>
                <button 
                  className={`btn flex-1 ${activeTab === 'deleted' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('deleted')}
                  style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  Deleted
                </button>
              </div>
            </div>
            
            {displayTransactions.length === 0 ? (
              <p className="text-muted text-center py-4">
                {activeTab === 'active' ? 'No active transactions.' : 'No deleted transactions.'}
              </p>
            ) : (
              <div className="transaction-list">
                {displayTransactions.slice(0, 10).map(t => (
                  <div key={t.id} className="transaction-item" style={{ opacity: t.is_deleted ? 0.6 : 1 }}>
                    <div className="flex items-center" style={{ flexGrow: 1 }}>
                      <div className="transaction-icon">
                        {t.type === 'expense' ? 
                          <ArrowDownRight className="amount-expense" size={20} /> : 
                          <ArrowUpRight className="amount-income" size={20} />
                        }
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-title">
                          {t.type === 'expense' ? t.category : 'Income added'}
                        </div>
                        <div className="transaction-meta">
                          <span>{t.person}</span>
                          {t.date && (
                            <>
                              <span>•</span>
                              <span>{new Date(t.date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                            </>
                          )}
                          {t.description && (
                            <>
                              <span>•</span>
                              <span>{t.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`transaction-amount ${t.type === 'expense' ? 'amount-expense' : 'amount-income'}`}>
                        {t.type === 'expense' ? '-' : '+'}₹{t.amount.toFixed(2)}
                      </div>
                      {!t.is_deleted && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', border: 'none', color: 'var(--danger)', background: 'transparent' }}
                          onClick={() => deleteTransaction(t.id)}
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {displayTransactions.length > 10 && (
                  <p className="text-center text-muted mt-2" style={{ fontSize: '0.875rem' }}>
                    Showing 10 most recent.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
