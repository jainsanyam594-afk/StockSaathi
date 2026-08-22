import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

function MyPlan() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { setError('Please log in to see your plan.'); setLoading(false); return; }
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) { setError('Complete onboarding first to get your plan.'); setLoading(false); return; }
        const profile = snap.data();
        const interest = (profile.interests && profile.interests[0]) || 'tech';
        const res = await axios.get('http://127.0.0.1:8000/plan', {
          params: { income: profile.income, risk: profile.risk, goal: profile.goal, interest },
        });
        setPlan(res.data);
        setLoading(false);
      } catch (err) {
        console.log('Plan error:', err);
        setError('Could not load your plan. Try again.');
        setLoading(false);
      }
    };
    loadPlan();
  }, []);

  const allocColors = ['#1B6B4C', '#639922', '#E0A82E', '#7F77DD'];
  const sectorColors = ['#1B6B4C', '#2E8B57', '#639922', '#E0A82E', '#C65B3C', '#7F77DD'];

  // Build the donut chart using SVG stroke-dasharray
  const buildDonut = (data, colors) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    return data.map((item, i) => {
      const dash = (item.percent / 100) * circumference;
      const circle = (
        <circle
          key={item.name}
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={colors[i % colors.length]}
          strokeWidth="24"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={-offset}
          transform="rotate(-90 80 80)"
        />
      );
      offset += dash;
      return circle;
    });
  };

  if (loading) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>My Plan</h1><p style={{ color: '#5A6960' }}>Building your personalized plan...</p></div>;
  if (error) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>My Plan</h1><p style={{ color: '#c0392b' }}>{error}</p></div>;

  return (
    <div style={{ maxWidth: '680px' }}>
      <h1 style={{ color: '#0F4230', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Your personal investment plan</h1>
      <p style={{ color: '#5A6960', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Built from your income, your <b style={{ color: '#0F4230' }}>{plan.risk_label}</b> risk profile, and your goal of <b style={{ color: '#0F4230' }}>{plan.goal}</b>.
      </p>

      <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#085041', marginBottom: '0.2rem' }}>First, we protect you</div>
        <div style={{ fontSize: '0.82rem', color: '#0F6E56', lineHeight: '1.55' }}>
          Before investing, make sure you have an emergency fund (3–6 months of expenses) and no high-interest debt. That safety net comes first — always.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Monthly income</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#0F4230' }}>₹{plan.monthly_income.toLocaleString('en-IN')}</div>
        </div>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Suggested to invest</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '600', color: '#0F4230' }}>₹{plan.invest_amount.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.7rem', color: '#5A6960' }}>{plan.invest_percent}% of income</div>
        </div>
        <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '13px', padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#5A6960', marginBottom: '0.3rem' }}>Risk profile</div>
          <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0F4230' }}>{plan.risk_label}</div>
        </div>
      </div>

      {/* Asset allocation with donut */}
      <div style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A6960', marginBottom: '0.85rem' }}>
        Where your ₹{plan.invest_amount.toLocaleString('en-IN')}/month goes
      </div>
      <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
          {buildDonut(plan.allocation, allocColors)}
        </svg>
        <div style={{ flex: 1, minWidth: '240px' }}>
          {plan.allocation.map((a, i) => (
            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: allocColors[i % allocColors.length], flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.88rem', color: '#0E1A14' }}>
                {a.name === 'Your interest sector' ? `Your interest: ${plan.interest_label}` : a.name}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0E1A14' }}>₹{a.amount.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.72rem', color: '#5A6960', marginLeft: '0.4rem' }}>{a.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector diversification */}
      <div style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A6960', marginBottom: '0.85rem' }}>
        Sector diversification
      </div>
      <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.82rem', color: '#5A6960', lineHeight: '1.55', marginBottom: '1rem' }}>
          Spreading your money across industries means one bad sector won't sink your whole portfolio. Your interest — <b style={{ color: '#0F4230' }}>{plan.interest_label}</b> — gets a bit more weight, while the rest stays diversified.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink: 0 }}>
            {buildDonut(plan.sectors, sectorColors)}
          </svg>
          <div style={{ flex: 1, minWidth: '240px' }}>
            {plan.sectors.map((s, i) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: sectorColors[i % sectorColors.length], flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '0.88rem', color: '#0E1A14' }}>{s.name}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0E1A14' }}>{s.percent}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.72rem', color: '#5A6960', textAlign: 'center', marginTop: '1rem', padding: '0.75rem', background: '#FEFDF9', borderRadius: '10px', lineHeight: '1.5' }}>
        This plan is generated for educational purposes based on your inputs. It is not financial advice. Consider consulting a SEBI-registered advisor for personalized guidance.
      </div>
    </div>
  );
}

export default MyPlan;