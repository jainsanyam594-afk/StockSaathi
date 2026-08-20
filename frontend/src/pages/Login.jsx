import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '16px', padding: '2rem', width: '360px', boxShadow: '0 8px 30px -12px rgba(0,0,0,0.15)' }}>
        <h1 style={{ color: '#0F4230', fontSize: '1.6rem', marginBottom: '0.3rem' }}>Welcome back</h1>
        <p style={{ color: '#5A6960', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Log in to StockSaathi</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(14,26,20,0.12)', marginBottom: '0.75rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(14,26,20,0.12)', marginBottom: '1rem', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
        />

        {error && <p style={{ color: '#c0392b', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

        <button onClick={handleLogin} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: 'none', background: '#1B6B4C', color: '#fff', fontWeight: '500', cursor: 'pointer', fontSize: '0.95rem', marginBottom: '1rem' }}>
          Log in
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#5A6960' }}>
          New here? <Link to="/signup" style={{ color: '#1B6B4C', fontWeight: '500' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;