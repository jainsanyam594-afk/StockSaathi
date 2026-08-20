import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Onboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    income: '',
    risk: '',
    goal: '',
    interests: [],
  });
  const navigate = useNavigate();

  const questions = [
    {
      key: 'income',
      kicker: 'About your money',
      title: 'What is your monthly income?',
      sub: 'This helps us suggest an amount that fits your life. Your data stays private.',
      type: 'single',
      options: [
        { label: 'Under ₹25,000', value: 'under_25k' },
        { label: '₹25,000 – ₹50,000', value: '25k_50k' },
        { label: '₹50,000 – ₹1,00,000', value: '50k_1L' },
        { label: 'Above ₹1,00,000', value: 'above_1L' },
      ],
    },
    {
      key: 'risk',
      kicker: 'Getting to know you',
      title: 'If your investment dropped 20% in a month, what would you do?',
      sub: "There are no wrong answers — this helps us build a plan you'll feel comfortable sticking with.",
      type: 'single',
      options: [
        { label: 'Sell everything immediately', value: 'very_low' },
        { label: 'Feel worried, but wait it out', value: 'low' },
        { label: 'Do nothing, stay calm', value: 'medium' },
        { label: "Buy more while it's cheap", value: 'high' },
      ],
    },
    {
      key: 'goal',
      kicker: 'Your goal',
      title: 'What are you mainly investing for?',
      sub: 'This shapes the kind of plan we build for you.',
      type: 'single',
      options: [
        { label: 'Long-term wealth', value: 'wealth' },
        { label: 'Retirement', value: 'retirement' },
        { label: 'A big purchase (house, car)', value: 'purchase' },
        { label: 'Just learning for now', value: 'learning' },
      ],
    },
    {
      key: 'interests',
      kicker: 'Your interests',
      title: 'Which sectors interest you? (pick any)',
      sub: "We'll tune your experience toward what you care about.",
      type: 'multi',
      options: [
        { label: 'Technology', value: 'tech' },
        { label: 'Banking & Finance', value: 'banking' },
        { label: 'Energy', value: 'energy' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Consumer goods', value: 'consumer' },
        { label: 'Automobile', value: 'auto' },
      ],
    },
  ];

  const current = questions[step];
  const isLast = step === questions.length - 1;

  const selectSingle = (value) => {
    setAnswers({ ...answers, [current.key]: value });
  };

  const toggleMulti = (value) => {
    const list = answers.interests;
    if (list.includes(value)) {
      setAnswers({ ...answers, interests: list.filter((v) => v !== value) });
    } else {
      setAnswers({ ...answers, interests: [...list, value] });
    }
  };

  const isSelected = (value) => {
    if (current.type === 'multi') return answers.interests.includes(value);
    return answers[current.key] === value;
  };

  const canContinue = () => {
    if (current.type === 'multi') return answers.interests.length > 0;
    return answers[current.key] !== '';
  };

  const handleNext = async () => {
    if (!isLast) {
      setStep(step + 1);
      return;
    }
    // Last step — save to Firestore
    try {
      const user = auth.currentUser;
      await setDoc(doc(db, 'users', user.uid), {
        ...answers,
        onboarded: true,
        email: user.email,
      });
      navigate('/');
    } catch (err) {
      console.log('Error saving onboarding:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '540px', background: '#FEFDF9', border: '1px solid rgba(14,26,20,0.12)', borderRadius: '20px', padding: '2rem 2.25rem', boxShadow: '0 12px 50px -18px rgba(14,26,20,0.18)' }}>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
          {questions.map((_, i) => (
            <div key={i} style={{ flex: 1, height: '5px', borderRadius: '3px', background: i < step ? '#1B6B4C' : i === step ? '#E0A82E' : 'rgba(14,26,20,0.12)' }} />
          ))}
        </div>
        <div style={{ fontSize: '12px', color: '#5A6960', marginBottom: '1.5rem' }}>
          Step {step + 1} of {questions.length}
        </div>

        <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1B6B4C', marginBottom: '0.5rem' }}>
          {current.kicker}
        </div>
        <h1 style={{ fontSize: '1.4rem', color: '#0E1A14', marginBottom: '0.4rem', lineHeight: '1.3' }}>{current.title}</h1>
        <p style={{ fontSize: '0.85rem', color: '#5A6960', lineHeight: '1.5', marginBottom: '1.5rem' }}>{current.sub}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
          {current.options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => current.type === 'multi' ? toggleMulti(opt.value) : selectSingle(opt.value)}
              style={{
                border: isSelected(opt.value) ? '2px solid #1B6B4C' : '1.5px solid rgba(14,26,20,0.12)',
                background: isSelected(opt.value) ? '#E4EFE7' : '#FEFDF9',
                borderRadius: '13px',
                padding: '0.9rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.95rem',
                color: '#0E1A14',
              }}
            >
              <span>{opt.label}</span>
              {isSelected(opt.value) && <span style={{ color: '#1B6B4C', fontWeight: 'bold' }}>✓</span>}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{ fontSize: '0.9rem', color: '#5A6960', padding: '0.75rem 1rem', borderRadius: '11px', border: 'none', background: 'none', cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            style={{
              marginLeft: 'auto',
              background: canContinue() ? '#1B6B4C' : 'rgba(14,26,20,0.15)',
              color: '#fff',
              padding: '0.8rem 1.75rem',
              borderRadius: '11px',
              fontSize: '0.9rem',
              fontWeight: '500',
              border: 'none',
              cursor: canContinue() ? 'pointer' : 'not-allowed',
            }}
          >
            {isLast ? 'Finish' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;