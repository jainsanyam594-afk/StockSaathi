import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const STARTING_CASH = 100000;

function Practice() {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [sellQtys, setSellQtys] = useState({});

  const refreshPrices = async (holdings) => {
    const syms = Object.keys(holdings);
    const newPrices = {};
    for (const sym of syms) {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/stock/${sym}`);
        newPrices[sym] = res.data.price;
      } catch (err) {
        newPrices[sym] = null;
      }
    }
    setPrices(newPrices);
  };

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) { setLoading(false); return; }
      const ref = doc(db, 'portfolios', user.uid);
      const snap = await getDoc(ref);
      let data;
      if (snap.exists()) {
        data = snap.data();
      } else {
        data = { cash: STARTING_CASH, holdings: {} };
        await setDoc(ref, data);
      }
      setPortfolio(data);
      await refreshPrices(data.holdings);
      setLoading(false);
    };
    load();
  }, []);

  const savePortfolio = async (updated) => {
    const user = auth.currentUser;
    await setDoc(doc(db, 'portfolios', user.uid), updated);
    setPortfolio(updated);
    await refreshPrices(updated.holdings);
  };

  const handleBuy = async () => {
    setMsg('');
    const sym = symbol.trim().toUpperCase();
    const quantity = parseInt(qty);
    if (!sym || !quantity || quantity <= 0) {
      setMsg('Enter a valid stock symbol and quantity.');
      return;
    }
    setBusy(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/stock/${sym}`);
      const price = res.data.price;
      const cost = price * quantity;
      if (cost > portfolio.cash) {
        setMsg(`Not enough cash. That costs ₹${cost.toLocaleString('en-IN')}, you have ₹${portfolio.cash.toLocaleString('en-IN')}.`);
        setBusy(false);
        return;
      }
      const holdings = { ...portfolio.holdings };
      if (holdings[sym]) {
        const existing = holdings[sym];
        const totalQty = existing.qty + quantity;
        const totalCost = existing.avgPrice * existing.qty + cost;
        holdings[sym] = { qty: totalQty, avgPrice: totalCost / totalQty };
      } else {
        holdings[sym] = { qty: quantity, avgPrice: price };
      }
      const updated = { cash: portfolio.cash - cost, holdings };
      await savePortfolio(updated);
      setMsg(`Bought ${quantity} share(s) of ${sym} at ₹${price.toLocaleString('en-IN')}.`);
      setSymbol('');
      setQty('');
    } catch (err) {
      console.log('Buy error:', err);
      setMsg(`Could not buy "${sym}". Check the symbol and try again.`);
    }
    setBusy(false);
  };

  const handleSell = async (sym, sellQty) => {
    setMsg('');
    const h = portfolio.holdings[sym];
    if (!h || sellQty <= 0 || sellQty > h.qty) return;
    try {
      const res = await axios.get(`http://127.0.0.1:8000/stock/${sym}`);
      const price = res.data.price;
      const proceeds = price * sellQty;
      const holdings = { ...portfolio.holdings };
      if (sellQty === h.qty) {
        delete holdings[sym];
      } else {
        holdings[sym] = { qty: h.qty - sellQty, avgPrice: h.avgPrice };
      }
      const updated = { cash: portfolio.cash + proceeds, holdings };
      await savePortfolio(updated);
      setMsg(`Sold ${sellQty} share(s) of ${sym} at ₹${price.toLocaleString('en-IN')}.`);
    } catch (err) {
      console.log('Sell error:', err);
      setMsg(`Could not sell "${sym}". Try again.`);
    }
  };

  if (loading) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>Practice</h1><p style={{ color: '#5A6960' }}>Loading your portfolio...</p></div>;
  if (!portfolio) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>Practice</h1><p style={{ color: '#c0392b' }}>Please log in to practice trading.</p></div>;

  const holdingSymbols = Object.keys(portfolio.holdings);

  let holdingsValue = 0;
  let investedCost = 0;
  holdingSymbols.forEach((sym) => {
    const h = portfolio.holdings[sym];
    const cur = prices[sym];
    if (cur != null) holdingsValue += cur * h.qty;
    investedCost += h.avgPrice * h.qty;
  });
  const totalValue = portfolio.cash + holdingsValue;
  const totalPL = holdingsValue - investedCost;
  const totalPLPercent = investedCost > 0 ? (totalPL / investedCost) * 100 : 0;

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ color: '#0F4230', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Paper Trading</h1>
      <p style={{ color: '#5A6960', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Practice investing with virtual money at real market prices. Zero risk — build confidence before you invest for real.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Total value</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#0F4230' }}>₹{Math.round(totalValue).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Available cash</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#0F4230' }}>₹{Math.round(portfolio.cash).toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Total profit/loss</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: totalPL >= 0 ? '#128a5e' : '#c0392b' }}>
            {totalPL >= 0 ? '+' : ''}₹{Math.round(totalPL).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.7rem', color: totalPL >= 0 ? '#128a5e' : '#c0392b' }}>
            {totalPL >= 0 ? '▲' : '▼'} {Math.abs(totalPLPercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0E1A14', marginBottom: '0.85rem' }}>Buy a stock</div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Symbol (e.g. TCS)"
            style={{ flex: 1, minWidth: '140px', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(14,26,20,0.12)', fontSize: '0.9rem', outline: 'none' }} />
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Quantity" type="number"
            style={{ width: '110px', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(14,26,20,0.12)', fontSize: '0.9rem', outline: 'none' }} />
          <button onClick={handleBuy} disabled={busy}
            style={{ padding: '0.6rem 1.4rem', borderRadius: '10px', border: 'none', background: busy ? 'rgba(14,26,20,0.2)' : '#1B6B4C', color: '#fff', fontWeight: '500', cursor: busy ? 'default' : 'pointer', fontSize: '0.9rem' }}>
            {busy ? '...' : 'Buy'}
          </button>
        </div>
        {msg && <div style={{ fontSize: '0.82rem', color: msg.startsWith('Bought') || msg.startsWith('Sold') ? '#128a5e' : '#c0392b' }}>{msg}</div>}
      </div>

      <div style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A6960', marginBottom: '0.85rem' }}>
        Your holdings
      </div>
      {holdingSymbols.length === 0 ? (
        <p style={{ color: '#5A6960', fontSize: '0.9rem' }}>No holdings yet. Buy your first stock above to get started.</p>
      ) : (
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '14px', padding: '0.5rem 1.25rem' }}>
          {holdingSymbols.map((sym) => {
            const h = portfolio.holdings[sym];
            const cur = prices[sym];
            const curValue = cur != null ? cur * h.qty : null;
            const cost = h.avgPrice * h.qty;
            const pl = curValue != null ? curValue - cost : null;
            const plPercent = cost > 0 && pl != null ? (pl / cost) * 100 : null;
            return (
              <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.85rem 0', borderBottom: '1px solid rgba(14,26,20,0.06)' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0E1A14' }}>{sym}</div>
                  <div style={{ fontSize: '0.78rem', color: '#5A6960' }}>
                    {h.qty} shares · avg ₹{h.avgPrice.toFixed(2)} · now {cur != null ? `₹${cur.toFixed(2)}` : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#0E1A14' }}>{curValue != null ? `₹${Math.round(curValue).toLocaleString('en-IN')}` : '—'}</div>
                  {pl != null && (
                    <div style={{ fontSize: '0.78rem', color: pl >= 0 ? '#128a5e' : '#c0392b' }}>
                      {pl >= 0 ? '▲' : '▼'} {pl >= 0 ? '+' : ''}₹{Math.round(pl).toLocaleString('en-IN')} ({Math.abs(plPercent).toFixed(2)}%)
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={sellQtys[sym] || ''}
                      onChange={(e) => setSellQtys({ ...sellQtys, [sym]: e.target.value })}
                      placeholder="Qty"
                      style={{ width: '60px', padding: '0.3rem 0.5rem', borderRadius: '7px', border: '1px solid rgba(14,26,20,0.15)', fontSize: '0.78rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => {
                        const q = parseInt(sellQtys[sym]);
                        if (q > 0 && q <= h.qty) {
                          handleSell(sym, q);
                          setSellQtys({ ...sellQtys, [sym]: '' });
                        } else {
                          setMsg(`Enter a quantity between 1 and ${h.qty} for ${sym}.`);
                        }
                      }}
                      style={{ padding: '0.3rem 0.8rem', borderRadius: '7px', border: '1px solid #c0392b', background: '#FEFDF9', color: '#c0392b', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>
                      Sell
                    </button>
                    <button
                      onClick={() => handleSell(sym, h.qty)}
                      style={{ padding: '0.3rem 0.8rem', borderRadius: '7px', border: 'none', background: '#c0392b', color: '#fff', fontSize: '0.75rem', fontWeight: '500', cursor: 'pointer' }}>
                      All
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Practice;