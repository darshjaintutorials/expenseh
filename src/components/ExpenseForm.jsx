import React, { useState } from 'react';
import { PlusCircle, Wallet, ArrowDownCircle } from 'lucide-react';

export default function ExpenseForm({ categories, persons, addTransaction, addCategory }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [newCategory, setNewCategory] = useState('');
  const [person, setPerson] = useState(persons[0]);
  const [description, setDescription] = useState('');

  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return;

    // Handle dynamically adding a category
    let finalCategory = category;
    if (showAddCategory && newCategory.trim()) {
      addCategory(newCategory.trim());
      finalCategory = newCategory.trim();
    }

    addTransaction({
      type,
      amount: parseFloat(amount),
      category: type === 'expense' ? finalCategory : 'Income',
      person,
      description,
      date: new Date().toISOString()
    });

    // Reset form
    setAmount('');
    setDescription('');
    if (showAddCategory) {
      setCategory(newCategory.trim() || categories[0]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="card glass">
      <div className="card-header">
        <h3>Add Transaction</h3>
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          className={`btn flex-1 ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setType('expense')}
        >
          <ArrowDownCircle size={18} /> Expense
        </button>
        <button 
          className={`btn flex-1 ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setType('income')}
          style={type === 'income' ? { backgroundColor: 'var(--success)' } : {}}
        >
          <Wallet size={18} /> Add Balance
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        {type === 'expense' && (
          <div className="form-group">
            <label className="form-label">Category</label>
            {!showAddCategory ? (
              <div className="flex gap-2">
                <select 
                  className="form-select flex-1"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddCategory(true)}
                  title="Add new category"
                >
                  <PlusCircle size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category Name"
                  required
                />
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddCategory(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Person Name</label>
          <select 
            className="form-select"
            value={person}
            onChange={(e) => setPerson(e.target.value)}
          >
            {persons.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4">
          Add {type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </form>
    </div>
  );
}
