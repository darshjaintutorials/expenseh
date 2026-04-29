import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function Visualizations({ transactions }) {
  const [activeTab, setActiveTab] = useState('category'); // 'category' or 'monthly'

  // Data for Pie Chart (Expenses by Category)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Data for Bar Chart (Monthly Income vs Expense)
  const monthlyData = useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
      const date = new Date(curr.date);
      // Format as "Jan 2024"
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expense: 0, timestamp: date.getTime() };
      }
      
      if (curr.type === 'income') {
        acc[monthYear].income += curr.amount;
      } else {
        acc[monthYear].expense += curr.amount;
      }
      
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.timestamp - b.timestamp);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="card glass h-full flex items-center justify-center" style={{ minHeight: '300px' }}>
        <p className="text-muted">No transactions yet. Add some to see the visualization.</p>
      </div>
    );
  }

  return (
    <div className="card glass">
      <div className="card-header">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h3>Spending Overview</h3>
          <div className="flex gap-2">
            <button 
              className={`btn ${activeTab === 'category' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('category')}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
            >
              Category
            </button>
            <button 
              className={`btn ${activeTab === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('monthly')}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}
            >
              Monthly
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ width: '100%', height: 350 }}>
        {activeTab === 'category' ? (
          categoryData.length > 0 ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted">No expenses to display.</p>
            </div>
          )
        ) : (
          <ResponsiveContainer>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} />
              <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-main)' }} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar dataKey="income" name="Income" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
