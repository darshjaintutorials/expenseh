import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export default function Visualizations({ transactions }) {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group by category
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest expense
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="card glass h-full flex items-center justify-center" style={{ minHeight: '300px' }}>
        <p className="text-muted">No expenses yet. Add some to see the visualization.</p>
      </div>
    );
  }

  return (
    <div className="card glass">
      <div className="card-header">
        <h3>Spending by Category</h3>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `₹${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
