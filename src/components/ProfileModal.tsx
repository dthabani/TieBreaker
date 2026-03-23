import React, { useState } from 'react';
import { X, Key, Trash2, Plus, LogOut, CheckCircle, Fingerprint } from 'lucide-react';
import type { UserProfile, ApiKey } from '../types';
import { registerBiometrics } from '../utils/webauthn';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  apiKeys: ApiKey[];
  activeKeyId: string | null;
  webauthnCredentialId: string | null;
  onAddKey: (label: string, key: string) => void;
  onDeleteKey: (id: string) => void;
  onSetActiveKey: (id: string) => void;
  onEnableBiometrics: (credId: string) => void;
  onDisableBiometrics: () => void;
  onUpdateMasterPassword: (newPassword: string) => void;
  onLock: () => void;
  onLogout: () => void;
}

export function ProfileModal({ 
  isOpen, onClose, user, apiKeys, activeKeyId, webauthnCredentialId, onAddKey, onDeleteKey, onSetActiveKey, onEnableBiometrics, onDisableBiometrics, onUpdateMasterPassword, onLock, onLogout
}: ProfileModalProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newKey, setNewKey] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLabel.trim() && newKey.trim()) {
      onAddKey(newLabel.trim(), newKey.trim());
      setNewLabel('');
      setNewKey('');
      setIsAdding(false);
    }
  };

  const handleRegisterBiometrics = async () => {
    try {
      const credId = await registerBiometrics(user.email);
      onEnableBiometrics(credId);
    } catch (err: any) {
      alert(err.message || 'Failed to register biometrics.');
    }
  };

  const handlePassUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 4) {
      setPassError('Password must be at least 4 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('Passwords do not match.');
      return;
    }
    onUpdateMasterPassword(newPass);
    setIsChangingPass(false);
    setNewPass('');
    setConfirmPass('');
    setPassError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="glass glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '1.5rem 2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={user.picture} alt={user.name} style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user.name}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</span>
            </div>
          </div>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem' }}>
              <Fingerprint size={18} /> Security & Access
            </h4>
            <button 
              className="btn" 
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)', transition: 'all 0.2s' }} 
              onClick={onLock}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
            >
              Lock Now
            </button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Biometric Lock</span>
              <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>WebAuthn</span>
            </div>
            {webauthnCredentialId ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--success)' }}>Touch ID is Enabled.</span>
                <button className="btn" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={onDisableBiometrics}>Disable</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use fingerprint for fast unlock.</span>
                <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={handleRegisterBiometrics}>Enable</button>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Master Password</span>
            </div>
            
            {!isChangingPass ? (
              <button className="btn" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem' }} onClick={() => setIsChangingPass(true)}>
                Change Master Password
              </button>
            ) : (
              <form onSubmit={handlePassUpdate} style={{ marginTop: '0.5rem' }}>
                <input type="password" className="input-field" style={{ padding: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem' }} value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New Password" required minLength={4} />
                <input type="password" className="input-field" style={{ padding: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem' }} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm New Password" required minLength={4} />
                {passError && <div style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{passError}</div>}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => setIsChangingPass(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}>Update</button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Key size={18} /> Managed API Keys
          </h4>
          
          {apiKeys.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No keys added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {apiKeys.map(k => (
                <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: activeKeyId === k.id ? '#f1f5f9' : 'var(--card-bg)', border: activeKeyId === k.id ? '1px solid var(--primary)' : '1px solid var(--card-border)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => onSetActiveKey(k.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    {activeKeyId === k.id ? <CheckCircle size={18} color="var(--primary)" /> : <div style={{width: 18, height: 18, borderRadius: '50%', border: '2px solid #94a3b8'}} />}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{k.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>...{k.key.slice(-4)}</div>
                    </div>
                  </div>
                  <button className="btn btn-icon" onClick={(e) => { e.stopPropagation(); onDeleteKey(k.id); }} style={{ color: 'var(--danger)', padding: '0.4rem' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isAdding ? (
            <button className="btn" style={{ width: '100%', marginTop: '1rem', fontSize: '0.9rem', padding: '0.6rem' }} onClick={() => setIsAdding(true)}>
              <Plus size={16} /> Add New Key
            </button>
          ) : (
            <form onSubmit={handleAdd} style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <div className="input-group" style={{ marginBottom: '0.8rem' }}>
                <label style={{ fontSize: '0.8rem' }}>Key Label (e.g., Work)</label>
                <input type="text" className="input-field" style={{ padding: '0.6rem', fontSize: '0.9rem' }} value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Personal Key" required />
              </div>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem' }}>Gemini API Key</label>
                <input type="password" className="input-field" style={{ padding: '0.6rem', fontSize: '0.9rem' }} value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="AIzaSy..." required />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }} onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}>Save Key</button>
              </div>
            </form>
          )}
        </div>

        <button className="btn" onClick={onLogout} style={{ width: '100%', color: 'var(--text-muted)', background: '#f8fafc', border: '1px solid var(--card-border)' }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );
}
