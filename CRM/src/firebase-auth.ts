/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.events');

// Safe storage helper to prevent cross-origin iframe security exceptions
const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      // ignore
    }
  },
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  }
};

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // If we have a cached token, invoke success.
      // Note: If token expires or page refreshes, we might need a fresh token.
      // We also store it in sessionStorage securely to handle soft-refreshes in AI Studio.
      const storedToken = safeSessionStorage.getItem('crm_oauth_token');
      if (storedToken) {
        cachedAccessToken = storedToken;
        if (onAuthSuccess) onAuthSuccess(user, storedToken);
      } else if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Not signing in and no token, trigger failure so user can sign in.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      safeSessionStorage.removeItem('crm_oauth_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    safeSessionStorage.setItem('crm_oauth_token', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  safeSessionStorage.removeItem('crm_oauth_token');
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken || safeSessionStorage.getItem('crm_oauth_token');
};
