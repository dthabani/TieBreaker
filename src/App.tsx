import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, BookmarkPlus, Bookmark, BookOpen, Fingerprint, ShieldCheck, Lock, Unlock } from 'lucide-react';
import { ProfileModal } from './components/ProfileModal';
import { LoginView } from './components/LoginView';
import { DecisionInput } from './components/DecisionInput';
import { LoadingView } from './components/LoadingView';
import { ResultsDashboard } from './components/ResultsDashboard';
import { SavedDecisionsModal } from './components/SavedDecisionsModal';
import { analyzeDecision } from './utils/ai';
import { verifyBiometrics } from './utils/webauthn';
import { hashPassword, verifyPassword } from './utils/security';
import type { AnalysisResult, AnalysisType, SavedDecision, UserProfile, ApiKey } from './types';
import './styles/components.css';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  
  const [masterPasswordHash, setMasterPasswordHash] = useState<string | null>(null);
  const [webauthnCredentialId, setWebauthnCredentialId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  
  const [appState, setAppState] = useState<'input' | 'loading' | 'results'>('input');
  const [currentDecisionText, setCurrentDecisionText] = useState('');
  const [currentAnalysisType, setCurrentAnalysisType] = useState<AnalysisType | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  
  const [savedDecisions, setSavedDecisions] = useState<SavedDecision[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('tiebreaker_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      const keysStr = localStorage.getItem(`tiebreaker_keys_${user.sub}`);
      const activeStr = localStorage.getItem(`tiebreaker_active_key_${user.sub}`);
      const passwordHash = localStorage.getItem(`tiebreaker_password_${user.sub}`);
      const webauthnId = localStorage.getItem(`tiebreaker_webauthn_${user.sub}`);

      if (passwordHash) {
        setMasterPasswordHash(passwordHash);
        
        // Check if we were already unlocked recently (within 10 mins)
        const lastUnlock = localStorage.getItem(`tiebreaker_unlocked_at_${user.sub}`);
        const now = Date.now();
        const INACTIVITY_LIMIT = 10 * 60 * 1000;

        if (lastUnlock && (now - parseInt(lastUnlock)) < INACTIVITY_LIMIT) {
          setIsLocked(false);
        } else {
          setIsLocked(true);
        }
      } else {
        setMasterPasswordHash(null);
        setIsLocked(false);
      }

      setWebauthnCredentialId(webauthnId || null);
      if (keysStr) setApiKeys(JSON.parse(keysStr));
      if (activeStr) setActiveKeyId(activeStr);
      
      const savedList = localStorage.getItem(`tiebreaker_saved_${user.sub}`);
      if (savedList) {
        try { setSavedDecisions(JSON.parse(savedList)); } catch (e) { console.error(e); }
      } else {
        setSavedDecisions([]);
      }
    }
  }, [user]);

  // AUTO-LOCK TIMER (10 Minutes)
  useEffect(() => {
    if (!user || isLocked || !masterPasswordHash) return;

    let timer: number;
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      
      // Update the "last active" timestamp in localStorage so it survives refreshes
      localStorage.setItem(`tiebreaker_unlocked_at_${user.sub}`, Date.now().toString());

      timer = window.setTimeout(() => {
        setIsLocked(true);
      }, INACTIVITY_LIMIT);
    };

    // Events that count as "activity"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(name => document.addEventListener(name, resetTimer));

    resetTimer(); // Start timer initially

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(name => document.removeEventListener(name, resetTimer));
    };
  }, [user, isLocked, masterPasswordHash]);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('tiebreaker_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    setApiKeys([]);
    setActiveKeyId(null);
    setSavedDecisions([]);
    setIsProfileOpen(false);
    setWebauthnCredentialId(null);
    setMasterPasswordHash(null);
    setIsLocked(false);
    localStorage.removeItem('tiebreaker_user');
  };

  const handleSetMasterPassword = async (password: string) => {
    if (!user) return;
    const hash = await hashPassword(password);
    setMasterPasswordHash(hash);
    localStorage.setItem(`tiebreaker_password_${user.sub}`, hash);
    setIsLocked(false);
  };

  const handleAddKey = (label: string, keyStr: string) => {
    if (!user) return;
    const newKey: ApiKey = { id: crypto.randomUUID(), label, key: keyStr };
    const newKeys = [...apiKeys, newKey];
    setApiKeys(newKeys);
    localStorage.setItem(`tiebreaker_keys_${user.sub}`, JSON.stringify(newKeys));
    
    if (!activeKeyId) {
      setActiveKeyId(newKey.id);
      localStorage.setItem(`tiebreaker_active_key_${user.sub}`, newKey.id);
    }
  };

  const handleDeleteKey = (id: string) => {
    if (!user) return;
    const newKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(newKeys);
    localStorage.setItem(`tiebreaker_keys_${user.sub}`, JSON.stringify(newKeys));
    if (activeKeyId === id) {
      setActiveKeyId(null);
      localStorage.removeItem(`tiebreaker_active_key_${user.sub}`);
    }
  };

  const handleSetActiveKey = (id: string) => {
    if (!user) return;
    setActiveKeyId(id);
    localStorage.setItem(`tiebreaker_active_key_${user.sub}`, id);
  };
  
  const handleEnableBiometrics = (credId: string) => {
    if (!user) return;
    setWebauthnCredentialId(credId);
    localStorage.setItem(`tiebreaker_webauthn_${user.sub}`, credId);
  };

  const handleDisableBiometrics = () => {
    if (!user) return;
    setWebauthnCredentialId(null);
    localStorage.removeItem(`tiebreaker_webauthn_${user.sub}`);
  };

  const handleManualLock = () => {
    if (!user) return;
    setIsLocked(true);
    setIsProfileOpen(false);
    localStorage.removeItem(`tiebreaker_unlocked_at_${user.sub}`);
  };

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPasswordHash || !user) return;
    setError(null);

    const { verified, needsUpgrade } = await verifyPassword(unlockPassword, masterPasswordHash);

    if (verified) {
      // Lazy migration: if the stored hash is the old SHA-256 format, silently
      // upgrade it to PBKDF2 on the first successful login.
      if (needsUpgrade) {
        const newHash = await hashPassword(unlockPassword);
        setMasterPasswordHash(newHash);
        localStorage.setItem(`tiebreaker_password_${user.sub}`, newHash);
      }

      setIsLocked(false);
      setUnlockPassword('');
      localStorage.setItem(`tiebreaker_unlocked_at_${user.sub}`, Date.now().toString());
    } else {
      setError('Incorrect Master Password.');
    }
  };

  const handleBiometricUnlock = async () => {
    if (!webauthnCredentialId || !user) return;
    setError(null);
    try {
      const success = await verifyBiometrics(webauthnCredentialId);
      if (success) {
        setIsLocked(false);
        localStorage.setItem(`tiebreaker_unlocked_at_${user.sub}`, Date.now().toString());
      } else {
        setError('Biometric verification failed.');
      }
    } catch (err: any) {
      setError('Biometric error: ' + err.message);
    }
  };

  const handleDecisionSubmit = async (decision: string, type: AnalysisType) => {
    const activeKey = apiKeys.find(k => k.id === activeKeyId);
    if (!activeKey) {
      setError('Please add and select a Google Gemini API key in your Profile first.');
      setIsProfileOpen(true);
      return;
    }

    setAppState('loading');
    setError(null);
    setCurrentDecisionText(decision);
    setCurrentAnalysisType(type);

    try {
      const analysis = await analyzeDecision(decision, activeKey.key, type);
      setResult(analysis);
      setAppState('results');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
      setAppState('input');
    }
  };

  const handleReset = () => {
    setAppState('input');
    setResult(null);
    setCurrentDecisionText('');
    setError(null);
  };

  const handleSaveResult = () => {
    if (!result || !currentDecisionText || !user) return;
    
    const isAlreadySaved = savedDecisions.some(
      s => s.decisionText === currentDecisionText && s.result.type === result.type
    );
    if (isAlreadySaved) return;

    const newSaved: SavedDecision = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      decisionText: currentDecisionText,
      result: result
    };
    
    const updated = [newSaved, ...savedDecisions];
    setSavedDecisions(updated);
    localStorage.setItem(`tiebreaker_saved_${user.sub}`, JSON.stringify(updated));
  };

  const handleLoadSavedDecision = (saved: SavedDecision) => {
    setCurrentDecisionText(saved.decisionText);
    setResult(saved.result);
    setAppState('results');
    setIsSavedOpen(false);
  };

  const handleDeleteSavedDecision = (id: string) => {
    if (!user) return;
    const updated = savedDecisions.filter(s => s.id !== id);
    setSavedDecisions(updated);
    localStorage.setItem(`tiebreaker_saved_${user.sub}`, JSON.stringify(updated));
  };

  const isCurrentSaved = savedDecisions.some(
    s => s.decisionText === currentDecisionText && s.result.type === result?.type
  );

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }
  
  // INITIAL SETUP: Force user to set a master password if none exists
  if (!masterPasswordHash) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', marginTop: '10vh', maxWidth: '500px', margin: '15vh auto' }}>
        <ShieldCheck size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Secure Your Data</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please set a local <strong>Master Password</strong>. This will be required to unlock your API keys and saved decisions.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const pwd = (e.target as any).setupPassword.value;
          const confirm = (e.target as any).confirmPassword.value;
          if (pwd !== confirm) {
            setError("Passwords don't match.");
            return;
          }
          handleSetMasterPassword(pwd);
        }}>
          <div className="input-group">
            <label>Master Password</label>
            <input name="setupPassword" type="password" className="input-field" placeholder="Choose a strong password" required minLength={4} />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" className="input-field" placeholder="Type it again" required minLength={4} />
          </div>
          {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
            Set Password & Continue
          </button>
        </form>
      </div>
    );
  }

  // LOCKED SCREEN: Traditional password + Optional Biometric trigger
  if (isLocked) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', marginTop: '15vh', maxWidth: '400px', margin: '15vh auto' }}>
        <Lock size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>App Locked</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your Master Password to access your profile and keys.</p>
        
        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', padding: '0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordUnlock} style={{ marginBottom: '1.5rem' }}>
          <div className="input-group">
            <input 
              type="password" 
              className="input-field" 
              placeholder="Master Password" 
              value={unlockPassword} 
              onChange={e => setUnlockPassword(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            <Unlock size={18} /> Unlock App
          </button>
        </form>

        {webauthnCredentialId && (
          <button className="btn" style={{ width: '100%', marginBottom: '1rem', background: '#f8fafc', border: '1px solid var(--card-border)' }} onClick={handleBiometricUnlock}>
            <Fingerprint size={18} /> Use Touch ID
          </button>
        )}

        <button className="btn" style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text-muted)' }} onClick={handleLogout}>
          Sign Out of Google
        </button>
      </div>
    );
  }

  return (
    <>
      <header className="app-header" style={{ gap: '1rem', paddingRight: '1.5rem', paddingTop: '1.5rem' }}>
        <button 
          className="btn btn-icon" 
          onClick={() => setIsSavedOpen(true)} 
          aria-label="View Saved Decisions"
          data-tooltip="Saved Decisions"
        >
          <BookOpen size={28} />
        </button>
        <button 
          className="btn btn-icon" 
          style={{ 
            padding: 0, 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid transparent', 
            transition: 'border-color 0.2s' 
          }} 
          onClick={() => setIsProfileOpen(true)} 
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} 
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
          aria-label={`Profile: ${user.name} (${user.email})`}
          data-tooltip={`Account: ${user.name}`}
        >
          <img src={user.picture} alt="Profile" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', display: 'block' }} referrerPolicy="no-referrer" />
        </button>
      </header>

      <main style={{ paddingBottom: '4rem' }}>
        {appState === 'input' && (
          <div className="glass-card" style={{ textAlign: 'center', marginTop: '2vh' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>The Tiebreaker</h1>
            <p className="subtitle" style={{ fontSize: '1.2rem' }}>Let AI weigh the options for your toughest decisions.</p>
            
            {error && (
              <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ padding: '1rem', marginTop: '2rem' }}>
              <DecisionInput onSubmit={handleDecisionSubmit} disabled={false} />
            </div>
          </div>
        )}

        {appState === 'loading' && currentAnalysisType && <LoadingView type={currentAnalysisType} />}

        {appState === 'results' && result && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: '300px' }}>
                <h1 style={{ textAlign: 'left', margin: 0, fontSize: '2.5rem' }}>Analysis Results</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  "{currentDecisionText}"
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className={`btn ${isCurrentSaved ? 'btn-primary' : ''}`} onClick={handleSaveResult} disabled={isCurrentSaved} style={{ background: isCurrentSaved ? 'var(--success)' : '' }}>
                  {isCurrentSaved ? <Bookmark size={20} /> : <BookmarkPlus size={20} />} 
                  {isCurrentSaved ? 'Saved' : 'Save'}
                </button>
                <button className="btn" onClick={handleReset}>
                  <RefreshCw size={20} /> Start Over
                </button>
              </div>
            </div>
            
            <ResultsDashboard result={result} />
          </div>
        )}
      </main>

      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        apiKeys={apiKeys} 
        activeKeyId={activeKeyId} 
        webauthnCredentialId={webauthnCredentialId}
        onAddKey={handleAddKey} 
        onDeleteKey={handleDeleteKey} 
        onSetActiveKey={handleSetActiveKey} 
        onEnableBiometrics={handleEnableBiometrics}
        onDisableBiometrics={handleDisableBiometrics}
        onUpdateMasterPassword={handleSetMasterPassword}
        onLock={handleManualLock}
        onLogout={handleLogout} 
      />

      <SavedDecisionsModal isOpen={isSavedOpen} onClose={() => setIsSavedOpen(false)} savedDecisions={savedDecisions} onLoadDecision={handleLoadSavedDecision} onDeleteDecision={handleDeleteSavedDecision} />
    </>
  );
}

export default App;
