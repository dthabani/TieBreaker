import type { AnalysisResult } from '../types';
import { ThumbsUp, ThumbsDown, Target, Zap, ShieldAlert, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
  
  if (result.type === 'pros_cons') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass glass-card" style={{ padding: '0', borderWidth: '0', background: 'transparent', boxShadow: 'none' }}>
        <div className="results-grid-2x2">
          
          <div className="glass glass-card" style={{ borderTop: '4px solid var(--success)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--success)', fontSize: '1.6rem' }}>
              <ThumbsUp size={28} /> Pros
            </h3>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--text-color)', fontSize: '1.1rem' }}>
              {result.data.pros.map((pro, index) => <li key={index} style={{ marginBottom: '1rem' }}>{pro}</li>)}
            </ul>
          </div>

          <div className="glass glass-card" style={{ borderTop: '4px solid var(--danger)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--danger)', fontSize: '1.6rem' }}>
              <ThumbsDown size={28} /> Cons
            </h3>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1.5rem', lineHeight: '1.8', color: 'var(--text-color)', fontSize: '1.1rem' }}>
              {result.data.cons.map((con, index) => <li key={index} style={{ marginBottom: '1rem' }}>{con}</li>)}
            </ul>
          </div>

        </div>
      </motion.div>
    );
  }

  if (result.type === 'swot') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="results-grid-2x2">
          
          <div className="glass glass-card" style={{ borderTop: '4px solid var(--success)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <Target color="var(--success)" size={26} /> Strengths
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.strengths.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}>{item}</li>)}
            </ul>
          </div>
          
          <div className="glass glass-card" style={{ borderTop: '4px solid var(--danger)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <AlertTriangle color="var(--danger)" size={26} /> Weaknesses
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.weaknesses.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}>{item}</li>)}
            </ul>
          </div>

          <div className="glass glass-card" style={{ borderTop: '4px solid var(--secondary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <Zap color="var(--secondary)" size={26} /> Opportunities
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.opportunities.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}>{item}</li>)}
            </ul>
          </div>

          <div className="glass glass-card" style={{ borderTop: '4px solid var(--warning)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <ShieldAlert color="var(--warning)" size={26} /> Threats
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.threats.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}>{item}</li>)}
            </ul>
          </div>

        </div>
      </motion.div>
    );
  }

  if (result.type === 'comparison') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {result.data.options.map((option, index) => (
          <div key={index} className="glass glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: 0, color: 'var(--primary)', fontSize: '2rem' }}>
              <Scale size={32} /> {option.name}
            </h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', marginTop: '0.5rem' }}>{option.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', marginBottom: '1rem', marginTop: 0 }}><ThumbsUp size={24}/> Pros</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-color)', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                  {option.pros.map((pro, i) => <li key={i} style={{ marginBottom: '0.6rem' }}>{pro}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem', marginBottom: '1rem', marginTop: 0 }}><ThumbsDown size={24}/> Cons</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-color)', lineHeight: '1.7', margin: 0, fontSize: '1.05rem' }}>
                  {option.cons.map((con, i) => <li key={i} style={{ marginBottom: '0.6rem' }}>{con}</li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  return null;
}
