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
        if (!user) {
          setError('Please log in to see your plan.');
          setLoading(false);
          return;
        }

        // Read the user's onboarding profile from Firestore
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!snap.exists()) {
          setError('Complete onboarding first to get your plan.');
          setLoading(false);
          return;
        }
        const profile = snap.data();
        const interest = (profile.interests && profile.interests[0]) || 'tech';

        // Ask the backend plan engine
        const res = await axios.get('http://127.0.0.1:8000/plan', {
          params: {
            income: profile.income,
            risk: profile.risk,
            goal: profile.goal,
            interest: interest,
          },
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

  const colors = ['#1B6B4C', '#639922', '#E0A82E', '#7F77DD'];

  if (loading) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>My Plan</h1><p style={{ color: '#5A6960' }}>Building your personalized plan...</p></div>;
  if (error) return <div><h1 style={{ color: '#0F4230', fontSize: '1.8rem' }}>My Plan</h1><p style={{ color: '#c0392b' }}>{error}</p></div>;

  return (
    <div style={{ maxWidth: '640px' }}>
      <h1 style={{ color: '#0F4230', fontSize: '1.8rem', marginBottom: '0.4rem' }}>Your personal investment plan</h1>
      <p style={{ color: '#5A6960', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Built from your income, your <b style={{ color: '#0F4230' }}>{plan.risk_label}</b> risk profile, and your goal of <b style={{ color: '#0F4230' }}>{plan.goal}</b>.
      </p>

      {/* Protective card */}
      <div style={{ background: '#E1F5EE', border: '1px solid #9FE1CB', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#085041', marginBottom: '0.2rem' }}>First, we protect you</div>
        <div style={{ fontSize: '0.82rem', color: '#0F6E56', lineHeight: '1.55' }}>
          Before investing, make sure you have an emergency fund (3–6 months of expenses) and no high-interest debt. That safety net comes first — always.
        </div>
      </div>

      {/* Summary */}
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

      {/* Allocation */}
      <div style={{ fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#5A6960', marginBottom: '0.85rem' }}>
        Where your ₹{plan.invest_amount.toLocaleString('en-IN')}/month goes
      </div>
      <div style={{ background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '16px', padding: '1.25rem' }}>
        {/* Bar */}
        <div style={{ display: 'flex', height: '30px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.1rem' }}>
          {plan.allocation.map((a, i) => (
            <div key={a.name} style={{ width: `${a.percent}%`, background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: '600' }}>
              {a.percent}%
            </div>
          ))}
        </div>
        {/* Rows */}
        {plan.allocation.map((a, i) => (
          <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: colors[i % colors.length], flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '0.9rem', color: '#0E1A14' }}>
              {a.name === 'Your interest sector' ? `Your interest: ${plan.interest}` : a.name}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0E1A14' }}>₹{a.amount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.7rem', color: '#5A6960' }}>{a.percent}%</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.72rem', color: '#5A6960', textAlign: 'center', marginTop: '1.25rem', padding: '0.75rem', background: '#FEFDF9', borderRadius: '10px', lineHeight: '1.5' }}>
        This plan is generated for educational purposes based on your inputs. It is not financial advice. Consider consulting a SEBI-registered advisor for personalized guidance.
      </div>
    </div>
  );
}

export default MyPlan;