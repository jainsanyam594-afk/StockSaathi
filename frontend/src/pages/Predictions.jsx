import React, { useState } from 'react';
import axios from 'axios';

function Predictions() {
  const [symbol, setSymbol] = useState('RELIANCE');
  const [searchInput, setSearchInput] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrediction = (sym) => {
    setLoading(true);
    setError('');
    setPrediction(null);
    axios.get(`http://127.0.0.1:8000/predict/${sym}`)
      .then((res) => {
        setPrediction(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Prediction error:', err);
        setError(`Could not predict "${sym}". Try another symbol.`);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    if (searchInput.trim() !== '') {
      const sym = searchInput.trim().toUpperCase();
      setSymbol(sym);
      fetchPrediction(sym);
      setSearchInput('');
    }
  };

  return (
    <div>
      <h1 style={{ color: '#0F4230', fontSize: '1.8rem', marginBottom: '0.5rem' }}>AI Predictions</h1>
      <p style={{ color: '#5A6960', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        An educational estimate of a stock's likely next move, based on recent price trends.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Enter a stock (e.g. RELIANCE)"
          style={{ padding: '0.6rem 1rem', borderRadius: '100px', border: '1px solid rgba(14,26,20,0.12)', background: '#FEFDF9', fontSize: '0.9rem', width: '260px', outline: 'none' }}
        />
        <button onClick={handleSearch} style={{ padding: '0.6rem 1.2rem', borderRadius: '100px', border: 'none', background: '#1B6B4C', color: '#fff', fontWeight: '500', cursor: 'pointer', fontSize: '0.9rem' }}>
          Predict
        </button>
      </div>

      {loading && <p style={{ color: '#5A6960' }}>Analyzing {symbol}...</p>}
      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      {prediction && (
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '16px', padding: '1.5rem 2rem', width: '480px', boxShadow: '0 8px 30px -12px rgba(0,0,0,0.15)' }}>
          <h2 style={{ margin: '0 0 1rem', color: '#0E1A14' }}>{prediction.symbol}</h2>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#5A6960', marginBottom: '0.25rem' }}>Current price</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0E1A14' }}>₹{prediction.current_price}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#5A6960', marginBottom: '0.25rem' }}>Predicted next</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: prediction.direction === 'up' ? '#128a5e' : '#c0392b' }}>
                ₹{prediction.predicted_price}
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.4rem 0.9rem',
            borderRadius: '100px',
            background: prediction.direction === 'up' ? '#E1F5EE' : '#FCEBEB',
            color: prediction.direction === 'up' ? '#085041' : '#791F1F',
            fontWeight: '500',
            fontSize: '0.9rem',
            marginBottom: '1.25rem'
          }}>
            {prediction.direction === 'up' ? '▲' : '▼'} Estimated {prediction.change_percent}% ({prediction.change >= 0 ? '+' : ''}₹{prediction.change})
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#5A6960', marginBottom: '0.35rem' }}>
              <span>Model confidence</span>
              <span>{prediction.confidence}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(14,26,20,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${prediction.confidence}%`, background: '#1B6B4C', borderRadius: '4px' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#5A6960', marginTop: '0.35rem' }}>
              How closely recent prices followed a clear trend. Low confidence means choppy, unpredictable movement.
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#5A6960', background: '#F7F4EC', padding: '0.75rem', borderRadius: '8px', lineHeight: '1.5' }}>
            ⚠️ This is a model estimate for educational purposes only, not financial advice. Stock markets are inherently unpredictable. Always do your own research.
          </div>
        </div>
      )}
    </div>
  );
}

export default Predictions;