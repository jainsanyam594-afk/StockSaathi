import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from './Chart';

function App() {
  const [stock, setStock] = useState(null);
  const [symbol, setSymbol] = useState('RELIANCE');
  const [period, setPeriod] = useState('1mo');

  const stockList = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN'];

  useEffect(() => {
    setStock(null);
    axios.get(`http://127.0.0.1:8000/stock/${symbol}`)
      .then((response) => {
        setStock(response.data);
      })
      .catch((error) => {
        console.log('Error fetching stock:', error);
      });
  }, [symbol]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4EC',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '3rem'
    }}>
      <h1 style={{ color: '#0F4230', fontSize: '2rem', marginBottom: '1.5rem' }}>
        StockSaathi
      </h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {stockList.map((item) => (
          <button
            key={item}
            onClick={() => setSymbol(item)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '100px',
              border: symbol === item ? '2px solid #1B6B4C' : '1px solid rgba(14,26,20,0.12)',
              background: symbol === item ? '#E4EFE7' : '#FEFDF9',
              color: '#0F4230',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {[
          { label: '1W', value: '5d' },
          { label: '1M', value: '1mo' },
          { label: '6M', value: '6mo' },
          { label: '1Y', value: '1y' },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setPeriod(range.value)}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: '8px',
              border: period === range.value ? '2px solid #1B6B4C' : '1px solid rgba(14,26,20,0.12)',
              background: period === range.value ? '#1B6B4C' : '#FEFDF9',
              color: period === range.value ? '#fff' : '#5A6960',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            {range.label}
          </button>
        ))}
      </div>

      {stock ? (
        <div style={{
          background: '#FEFDF9',
          border: '1px solid rgba(14,26,20,0.12)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          width: '500px',
          boxShadow: '0 8px 30px -12px rgba(0,0,0,0.15)'
        }}>
          <h2 style={{ margin: '0 0 0.5rem', color: '#0E1A14' }}>{stock.symbol}</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#0E1A14' }}>
            ₹{stock.price}
          </p>
          <p style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: stock.change >= 0 ? '#128a5e' : '#c0392b',
            margin: '0 0 1rem'
          }}>
            {stock.change >= 0 ? '▲' : '▼'} {stock.change} ({stock.change_percent}%)
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#5A6960' }}>
            <span>High: ₹{stock.day_high}</span>
            <span>Low: ₹{stock.day_low}</span>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Chart symbol={symbol} period={period} />
          </div>
        </div>
      ) : (
        <p>Loading stock data...</p>
      )}
    </div>
  );
}

export default App;