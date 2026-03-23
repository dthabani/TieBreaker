import { X, Clock, Trash2 } from 'lucide-react';
import type { SavedDecision } from '../types';

/** 
 * Validates that the saved data matches the structure 
 * required by the current version of the UI.
 */
function isCompatible(saved: SavedDecision): boolean {
  const d = saved.result.data as any;
  if (saved.schemaVersion === 2) return true;

  switch (saved.result.type) {
    case 'pros_cons':
      return !!d.categories && Array.isArray(d.categories);
    case 'comparison':
      return !!d.criteria && Array.isArray(d.criteria);
    case 'swot':
      return !!d.swot;
    default:
      return false;
  }
}

interface SavedDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: SavedDecision[];
  onLoadDecision: (decision: SavedDecision) => void;
  onDeleteDecision: (id: string) => void;
}

export function SavedDecisionsModal({ isOpen, onClose, savedDecisions, onLoadDecision, onDeleteDecision }: SavedDecisionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="glass glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2><Clock size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Saved Decisions</h2>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {savedDecisions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
              <p>No saved decisions yet. Analyze a decision and click "Save Decision" to see it here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {savedDecisions.sort((a,b) => b.timestamp - a.timestamp).map(saved => (
                <div key={saved.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer', borderBottom: '1px solid var(--card-border)' }}
                  onClick={() => onLoadDecision(saved)}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ overflow: 'hidden', flex: 1, paddingRight: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-color)' }}>
                      {saved.decisionText}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(saved.timestamp).toLocaleDateString()} • {saved.result.type.replace('_', ' ').toUpperCase()}
                      {!isCompatible(saved) && (
                        <span style={{ marginLeft: '0.5rem', background: '#fee2e2', color: '#991b1b', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                          Incompatible
                        </span>
                      )}
                    </span>
                  </div>
                  <button 
                    className="btn btn-icon" 
                    onClick={(e) => { e.stopPropagation(); onDeleteDecision(saved.id); }}
                    style={{ color: 'var(--danger)' }}
                    title="Delete saved decision"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
