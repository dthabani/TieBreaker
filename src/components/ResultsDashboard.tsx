import type { AnalysisResult } from '../types';
import { ThumbsUp, ThumbsDown, Target, Zap, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Markdown } from '../utils/markdown';

interface ResultsDashboardProps {
  result: AnalysisResult;
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {

  // Pros & Cons: one card per option, pros/cons side by side 
  if (result.type === 'pros_cons') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {result.data.options.map((option, index) => (
          <div key={index} className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.6rem' }}>
              {option.name}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginTop: 0, marginBottom: '0.8rem' }}>
                  <ThumbsUp size={20} /> Pros
                </h4>
                <ul style={{ paddingLeft: '1.4rem', margin: 0, lineHeight: '1.75', color: 'var(--text-color)', fontSize: '1rem' }}>
                  {option.pros.map((pro, i) => <li key={i} style={{ marginBottom: '0.6rem' }}><Markdown>{pro}</Markdown></li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginTop: 0, marginBottom: '0.8rem' }}>
                  <ThumbsDown size={20} /> Cons
                </h4>
                <ul style={{ paddingLeft: '1.4rem', margin: 0, lineHeight: '1.75', color: 'var(--text-color)', fontSize: '1rem' }}>
                  {option.cons.map((con, i) => <li key={i} style={{ marginBottom: '0.6rem' }}><Markdown>{con}</Markdown></li>)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  // Comparison Table: criteria rows × options columns
  if (result.type === 'comparison') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--card-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', background: 'var(--card-bg)' }}>
            <thead>
              <tr style={{ background: 'var(--primary)' }}>
                <th style={{ padding: '1rem 1.2rem', textAlign: 'left', color: '#fff', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                  Criteria
                </th>
                {result.data.options.map((opt, i) => (
                  <th key={i} style={{ padding: '1rem 1.2rem', textAlign: 'left', color: '#fff', fontWeight: 600, borderRight: i < result.data.options.length - 1 ? '1px solid rgba(255,255,255,0.2)' : undefined }}>
                    {opt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.data.criteria.map((row, rowIdx) => (
                <tr key={rowIdx} style={{ background: rowIdx % 2 === 0 ? 'var(--card-bg)' : '#f8fafc', borderTop: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '0.9rem 1.2rem', fontWeight: 600, color: 'var(--text-color)', borderRight: '1px solid var(--card-border)', whiteSpace: 'nowrap' }}>
                    {row.name}
                  </td>
                  {row.values.map((val, colIdx) => (
                    <td key={colIdx} style={{ padding: '0.9rem 1.2rem', color: 'var(--text-muted)', borderRight: colIdx < row.values.length - 1 ? '1px solid var(--card-border)' : undefined, lineHeight: '1.6' }}>
                      <Markdown>{val}</Markdown>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  // SWOT: 2×2 grid
  if (result.type === 'swot') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="results-grid-2x2">
          
          <div className="glass-card" style={{ borderTop: '4px solid var(--success)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <Target color="var(--success)" size={26} /> Strengths
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.strengths.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}><Markdown>{item}</Markdown></li>)}
            </ul>
          </div>

          <div className="glass-card" style={{ borderTop: '4px solid var(--danger)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <AlertTriangle color="var(--danger)" size={26} /> Weaknesses
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.weaknesses.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}><Markdown>{item}</Markdown></li>)}
            </ul>
          </div>

          <div className="glass-card" style={{ borderTop: '4px solid var(--secondary)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <Zap color="var(--secondary)" size={26} /> Opportunities
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.opportunities.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}><Markdown>{item}</Markdown></li>)}
            </ul>
          </div>

          <div className="glass-card" style={{ borderTop: '4px solid var(--warning)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', margin: 0, paddingBottom: '1rem', fontSize: '1.4rem' }}>
              <ShieldAlert color="var(--warning)" size={26} /> Threats
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.5rem', lineHeight: '1.7', fontSize: '1.05rem' }}>
              {result.data.swot.threats.map((item, i) => <li key={i} style={{ marginBottom: '0.8rem' }}><Markdown>{item}</Markdown></li>)}
            </ul>
          </div>

        </div>
      </motion.div>
    );
  }

  return null;
}
