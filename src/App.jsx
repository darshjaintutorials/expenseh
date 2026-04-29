import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';

const INITIAL_CATEGORIES = [
  'Food', 'Petrol', 'Grocery', 'Electricity bill', 
  'Wi-Fi bill', 'Maid', 'Milk', 'Kitchen maid', 'Other'
];

const PERSONS = ['Darsh', 'Garv', 'Kavi', 'Parsh'];

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // App State
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [startingBalance, setStartingBalance] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchData(session.user.id);
    }
  }, [session]);

  const fetchData = async (userId) => {
    // Fetch user settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsData) {
      setCategories(settingsData.categories);
      setStartingBalance(Number(settingsData.starting_balance));
    } else if (settingsError?.code === 'PGRST116') {
      // Create initial settings if not found
      await supabase.from('user_settings').insert({
        user_id: userId,
        starting_balance: 0,
        categories: INITIAL_CATEGORIES
      });
    }

    // Fetch transactions
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (txData) {
      setTransactions(txData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const addTransaction = async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...transaction, user_id: session.user.id })
      .select()
      .single();
      
    if (data && !error) {
      setTransactions([data, ...transactions]);
    }
  };

  const addCategory = async (category) => {
    if (category && !categories.includes(category)) {
      const newCategories = [...categories, category];
      
      const { error } = await supabase
        .from('user_settings')
        .update({ categories: newCategories })
        .eq('user_id', session.user.id);

      if (!error) {
        setCategories(newCategories);
      }
    }
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (!error) {
      setTransactions(transactions.map(t => t.id === id ? { ...t, is_deleted: true } : t));
    }
  };

  const updateStartingBalance = async (newBalance) => {
    const { error } = await supabase
      .from('user_settings')
      .update({ starting_balance: newBalance })
      .eq('user_id', session.user.id);

    if (!error) {
      setStartingBalance(newBalance);
    }
  };

  if (loading) {
    return <div className="auth-wrapper"><div className="glass card p-8">Loading...</div></div>;
  }

  if (!session) {
    return <AdminLogin />;
  }

  const activeTransactions = transactions.filter(t => !t.is_deleted);

  // Calculate current balance
  const totalExpenses = activeTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const totalIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const currentBalance = startingBalance + totalIncome - totalExpenses;

  return (
    <Dashboard 
      onLogout={handleLogout}
      transactions={transactions}
      categories={categories}
      persons={PERSONS}
      currentBalance={currentBalance}
      startingBalance={startingBalance}
      setStartingBalance={updateStartingBalance}
      addTransaction={addTransaction}
      addCategory={addCategory}
      deleteTransaction={deleteTransaction}
    />
  );
}

export default App;
