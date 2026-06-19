import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({ name, email, password, role: 'USER' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('role', res.data.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>💰 Smart Expense Tracker</h2>
        <h3 style={styles.subtitle}>Create Account</h3>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#667eea',
    marginBottom: '8px',
    fontSize: '24px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '24px',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '16px',
  },
  link: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#666',
  },
};

export default Register;