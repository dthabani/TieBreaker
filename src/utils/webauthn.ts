export async function registerBiometrics(username: string): Promise<string> {
  if (!window.PublicKeyCredential) {
    throw new Error('Biometric authentication is not supported on this browser or device.');
  }

  // Generate a random challenge (Normally from a backend Server)
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // Generate a random User ID
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'Tiebreaker App',
      id: window.location.hostname // 'localhost'
    },
    user: {
      id: userId,
      name: username,
      displayName: username
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }  // RS256
    ],
    timeout: 60000,
    attestation: 'none',
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Forces local device (Touch ID / Windows Hello)
      userVerification: 'required'         // Requires successful biometric scan
    }
  };

  try {
    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    if (!credential) throw new Error('Registration failed or was cancelled.');
    
    // Convert binary rawId to Base64 to safely save in localStorage
    return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  } catch (err: any) {
    console.error('WebAuthn Error:', err);
    throw new Error(err.message || 'Failed to register biometrics.');
  }
}

export async function verifyBiometrics(credentialIdBase64: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // Convert Base64 string back to binary Uint8Array
  const rawId = Uint8Array.from(atob(credentialIdBase64), c => c.charCodeAt(0));

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    allowCredentials: [{
      id: rawId,
      type: 'public-key'
    }],
    userVerification: 'required',
    timeout: 60000
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey });
    return !!assertion; // If we get here without throwing, they successfully scanned their finger!
  } catch (err) {
    console.error('WebAuthn Verification Error:', err);
    return false;
  }
}
