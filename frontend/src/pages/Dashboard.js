import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getExpenses, addExpense, deleteExpense, getAnalytics,
  setOverallBudget, setCategoryBudget, getBudgetStatus
} from '../services/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Other'];

const STATUS_COLORS = {
  GREEN: '#43e97b',
  YELLOW: '#f5b800',
  RED: '#ff4757',
  NO_LIMIT_SET: '#ccc',
};

function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', amount: '', category: '', date: ''
  });
  const [budgetForm, setBudgetForm] = useState({
    overallLimit: '', category: '', categoryLimit: ''
  });
  const navigate = useNavigate();
  const name = localStorage.getItem('name');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, anaRes, budRes] = await Promise.all([
        getExpenses(),
        getAnalytics(),
        getBudgetStatus()
      ]);
      setExpenses(expRes.data);
      setAnalytics(anaRes.data);
      setBudgetStatus(budRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const checkLimitWarning = (updatedBudgetStatus) => {
    if (!updatedBudgetStatus) return null;

    const { overall, categories } = updatedBudgetStatus;
    const warnings = [];

    if (overall.status === 'RED') {
      warnings.push(`Overall budget exceeded! Spent ₹${overall.spent} of ₹${overall.limit}.`);
    } else if (overall.status === 'YELLOW') {
      warnings.push(`Overall budget at ${overall.percentage.toFixed(0)}% — Spent ₹${overall.spent} of ₹${overall.limit}.`);
    }

    categories.forEach((cat) => {
      if (cat.status === 'RED') {
        warnings.push(`"${cat.category}" budget exceeded! Spent ₹${cat.spent} of ₹${cat.limit}.`);
      } else if (cat.status === 'YELLOW') {
        warnings.push(`"${cat.category}" budget at ${cat.percentage.toFixed(0)}% — Spent ₹${cat.spent} of ₹${cat.limit}.`);
      }
    });

    return warnings.length > 0 ? warnings.join('\n') : null;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(form);
      setForm({ title: '', description: '', amount: '', category: '', date: '' });
      setShowForm(false);

      const budRes = await getBudgetStatus();
      setBudgetStatus(budRes.data);

      const warningMsg = checkLimitWarning(budRes.data);
      if (warningMsg) {
        alert(`⚠️ Budget Alert:\n\n${warningMsg}`);
      }

      fetchData();
    } catch (err) {
      alert('Error adding expense!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
      fetchData();
    }
  };

  const handleSetOverallBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.overallLimit) return;
    try {
      await setOverallBudget({ limitAmount: parseFloat(budgetForm.overallLimit) });
      setBudgetForm({ ...budgetForm, overallLimit: '' });
      const budRes = await getBudgetStatus();
      setBudgetStatus(budRes.data);
    } catch (err) {
      alert('Error setting overall budget!');
    }
  };

  const handleSetCategoryBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.categoryLimit) return;
    try {
      await setCategoryBudget({
        category: budgetForm.category,
        limitAmount: parseFloat(budgetForm.categoryLimit)
      });
      setBudgetForm({ ...budgetForm, category: '', categoryLimit: '' });
      const budRes = await getBudgetStatus();
      setBudgetStatus(budRes.data);
    } catch (err) {
      alert('Error setting category budget!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const chartData = analytics.categoryWise
    ? Object.entries(analytics.categoryWise).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>💰 Smart Expense Tracker</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Welcome, {name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats Cards */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>₹{analytics.totalExpenses?.toFixed(2) || '0.00'}</h3>
            <p style={styles.statLabel}>Total Expenses</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{expenses.length}</h3>
            <p style={styles.statLabel}>Total Transactions</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>
              {expenses.length > 0
                ? `₹${(analytics.totalExpenses / expenses.length).toFixed(2)}`
                : '₹0.00'}
            </h3>
            <p style={styles.statLabel}>Average Expense</p>
          </div>
        </div>

        {/* Budget Card */}
        <div style={styles.budgetCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.cardTitle}>📊 Monthly Budget</h3>
            <button
              style={styles.addBtn}
              onClick={() => setShowBudgetForm(!showBudgetForm)}
            >
              {showBudgetForm ? '✕ Close' : '⚙️ Set Budget'}
            </button>
          </div>

          {/* Overall Budget Progress */}
          {budgetStatus && budgetStatus.overall.limit ? (
            <div style={styles.budgetSection}>
              <div style={styles.budgetRow}>
                <span style={styles.budgetLabel}>Overall</span>
                <span style={styles.budgetText}>
                  ₹{budgetStatus.overall.spent.toFixed(2)} / ₹{budgetStatus.overall.limit.toFixed(2)}
                </span>
              </div>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${Math.min(budgetStatus.overall.percentage, 100)}%`,
                    background: STATUS_COLORS[budgetStatus.overall.status],
                  }}
                />
              </div>
            </div>
          ) : (
            <p style={styles.noData}>No overall budget set yet.</p>
          )}

          {/* Category Budgets Progress */}
          {budgetStatus && budgetStatus.categories.length > 0 && (
            <div style={styles.categoryBudgetList}>
              {budgetStatus.categories.map((cat) => (
                <div key={cat.category} style={styles.budgetSection}>
                  <div style={styles.budgetRow}>
                    <span style={styles.budgetLabel}>{cat.category}</span>
                    <span style={styles.budgetText}>
                      ₹{cat.spent.toFixed(2)} / ₹{cat.limit.toFixed(2)}
                    </span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${Math.min(cat.percentage, 100)}%`,
                        background: STATUS_COLORS[cat.status],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Set Budget Form */}
          {showBudgetForm && (
            <div style={styles.budgetFormsRow}>
              <form onSubmit={handleSetOverallBudget} style={styles.budgetFormBox}>
                <p style={styles.budgetFormTitle}>Set Overall Monthly Limit</p>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Overall limit (₹)"
                  value={budgetForm.overallLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, overallLimit: e.target.value })}
                />
                <button style={styles.submitBtn} type="submit">Save Overall Limit</button>
              </form>

              <form onSubmit={handleSetCategoryBudget} style={styles.budgetFormBox}>
                <p style={styles.budgetFormTitle}>Set Category Limit</p>
                <select
                  style={styles.input}
                  value={budgetForm.category}
                  onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Category limit (₹)"
                  value={budgetForm.categoryLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, categoryLimit: e.target.value })}
                />
                <button style={styles.submitBtn} type="submit">Save Category Limit</button>
              </form>
            </div>
          )}
        </div>

        {/* Chart + Add Button Row */}
        <div style={styles.middleRow}>
          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.cardTitle}>Expenses by Category</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={styles.noData}>No data yet — add some expenses!</p>
            )}
          </div>

          {/* Add Expense Form */}
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h3 style={styles.cardTitle}>Add Expense</h3>
              <button
                style={styles.addBtn}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? '✕ Cancel' : '+ Add New'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddExpense}>
                <input
                  style={styles.input}
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
                <input
                  style={styles.input}
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Amount (₹)"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">🍔 Food</option>
                  <option value="Transport">🚗 Transport</option>
                  <option value="Shopping">🛍️ Shopping</option>
                  <option value="Entertainment">🎬 Entertainment</option>
                  <option value="Health">💊 Health</option>
                  <option value="Education">📚 Education</option>
                  <option value="Other">📦 Other</option>
                </select>
                <input
                  style={styles.input}
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />

                {/* Inline budget warning while form is open */}
                {budgetStatus && form.category && form.amount && (() => {
                  const catBudget = budgetStatus.categories.find(c => c.category === form.category);
                  if (catBudget) {
                    const projectedSpent = catBudget.spent + parseFloat(form.amount || 0);
                    const projectedPct = (projectedSpent / catBudget.limit) * 100;
                    if (projectedPct >= 70) {
                      return (
                        <p style={{
                          ...styles.inlineWarning,
                          color: projectedPct >= 100 ? '#ff4757' : '#f5b800'
                        }}>
                          {projectedPct >= 100
                            ? `⚠️ This will exceed your "${form.category}" budget!`
                            : `⚠️ This will bring "${form.category}" close to its limit.`}
                        </p>
                      );
                    }
                  }
                  return null;
                })()}

                <button style={styles.submitBtn} type="submit">
                  Add Expense
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div style={styles.tableCard}>
          <h3 style={styles.cardTitle}>All Expenses</h3>
          {expenses.length === 0 ? (
            <p style={styles.noData}>No expenses yet!</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={styles.tableRow}>
                    <td style={styles.td}>{exp.title}</td>
                    <td style={styles.td}>{exp.category}</td>
                    <td style={styles.td}>₹{exp.amount}</td>
                    <td style={styles.td}>{exp.date}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(exp.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navTitle: { color: 'white', fontSize: '22px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'white', fontSize: '16px' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  content: { padding: '24px 32px' },
  statsRow: { display: 'flex', gap: '24px', marginBottom: '24px' },
  statCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    flex: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  statNumber: { fontSize: '28px', color: '#667eea', marginBottom: '8px' },
  statLabel: { color: '#666', fontSize: '14px' },
  budgetCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  budgetSection: { marginBottom: '16px' },
  budgetRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  budgetLabel: { color: '#333', fontWeight: '600', fontSize: '14px' },
  budgetText: { color: '#666', fontSize: '14px' },
  progressBarBg: {
    width: '100%',
    height: '10px',
    background: '#eee',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  categoryBudgetList: { marginTop: '8px' },
  budgetFormsRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #eee',
  },
  budgetFormBox: { flex: 1 },
  budgetFormTitle: { color: '#333', fontSize: '14px', marginBottom: '10px', fontWeight: '600' },
  inlineWarning: {
    fontSize: '13px',
    marginBottom: '12px',
    fontWeight: '600',
  },
  middleRow: { display: 'flex', gap: '24px', marginBottom: '24px' },
  chartCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    flex: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    flex: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: { color: '#333', fontSize: '18px' },
  addBtn: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  tableCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
  tableHeader: { background: '#f8f9ff' },
  th: {
    padding: '12px',
    textAlign: 'left',
    color: '#667eea',
    fontWeight: '600',
    borderBottom: '2px solid #eee',
  },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px', color: '#333' },
  deleteBtn: {
    background: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  noData: { color: '#999', textAlign: 'center', padding: '40px' },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '24px',
  },
};

export default Dashboard;