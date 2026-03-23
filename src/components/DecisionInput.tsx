import React, { useState } from 'react';
import { Sparkles, ListPlus, Scale, LayoutGrid } from 'lucide-react';
import type { AnalysisType } from '../types';

interface DecisionInputProps {
  onSubmit: (decision: string, type: AnalysisType) => void;
  disabled: boolean;
}

export function DecisionInput({ onSubmit, disabled }: DecisionInputProps) {
  const [decision, setDecision] = useState('');
  const [type, setType] = useState<AnalysisType>('pros_cons');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (decision.trim() && !disabled) {
      onSubmit(decision.trim(), type);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%', maxWidth: '750px', margin: '0 auto' }}>
      
      <div className="input-group" style={{ textAlign: 'left', marginBottom: 0 }}>
        <label htmlFor="decision" style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-color)', fontWeight: '500' }}>Describe your dilemma</label>
        <textarea
          id="decision"
          className="input-field"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Should I launch my startup now or wait six months to build more features?"
          disabled={disabled}
        />
      </div>

      <div style={{ textAlign: 'left' }}>
        <label style={{ fontSize: '1.2rem', color: 'var(--text-color)', fontWeight: '500', display: 'block', marginBottom: '1rem' }}>Choose Analysis Format</label>
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%' }} className="type-card-container">
          
          <button 
            type="button" 
            className={`type-card ${type === 'pros_cons' ? 'selected' : ''}`}
            onClick={() => setType('pros_cons')}
          >
            <ListPlus color={type === 'pros_cons' ? 'var(--primary)' : 'var(--text-muted)'} size={32} />
            <span style={{ fontWeight: '600', color: type === 'pros_cons' ? 'var(--text-color)' : 'var(--text-muted)' }}>Pros & Cons</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>A simple list of advantages and disadvantages.</span>
          </button>

          <button 
            type="button" 
            className={`type-card ${type === 'comparison' ? 'selected' : ''}`}
            onClick={() => setType('comparison')}
          >
            <Scale color={type === 'comparison' ? 'var(--primary)' : 'var(--text-muted)'} size={32} />
            <span style={{ fontWeight: '600', color: type === 'comparison' ? 'var(--text-color)' : 'var(--text-muted)' }}>Comparison Table</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Compare multiple options side-by-side.</span>
          </button>

          <button 
            type="button" 
            className={`type-card ${type === 'swot' ? 'selected' : ''}`}
            onClick={() => setType('swot')}
          >
            <LayoutGrid color={type === 'swot' ? 'var(--primary)' : 'var(--text-muted)'} size={32} />
            <span style={{ fontWeight: '600', color: type === 'swot' ? 'var(--text-color)' : 'var(--text-muted)' }}>SWOT Analysis</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Strengths, Weaknesses, Opportunities, & Threats.</span>
          </button>

        </div>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={disabled || !decision.trim()}
        style={{ padding: '1.2rem', fontSize: '1.25rem', marginTop: '1rem' }}
      >
        <Sparkles size={24} />
        Generate Analysis
      </button>
    </form>
  );
}
