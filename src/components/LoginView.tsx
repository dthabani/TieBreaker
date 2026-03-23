import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import type { UserProfile } from '../types';

interface LoginViewProps {
  onLogin: (user: UserProfile) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  return (
    <div className="glass glass-card" style={{ textAlign: 'center', marginTop: '10vh', maxWidth: '400px', margin: '10vh auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>The Tiebreaker</h1>
      <p className="subtitle" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>Please sign in to securely manage your API keys.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={credentialResponse => {
            if (credentialResponse.credential) {
              const decoded = jwtDecode<UserProfile>(credentialResponse.credential);
              onLogin({
                sub: decoded.sub,
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture
              });
            }
          }}
          onError={() => {
            console.error('Login Failed');
            alert('Google Login Failed. Be sure to configure a valid VITE_GOOGLE_CLIENT_ID in your .env file!');

          }}
          useOneTap
        />
      </div>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2rem' }}>
        Even though you are logging in, your API keys and decisions will remain <strong>strictly local</strong> to this device under your profile.
      </p>
    </div>
  );
}
