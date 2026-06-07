import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));

const app = initializeApp(cfg);
export const db = getFirestore(app, cfg.firestoreDatabaseId);
export const auth = getAuth(app);

export async function authenticateServer() {
  try {
    const email = 'server@sadaqabox.local';
    const password = process.env.PLAID_SECRET || 'fallback-secret-12345';
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        throw e;
      }
    }
    console.log('Server authenticated to Firebase as', auth.currentUser?.uid);
  } catch (err) {
    console.error('Failed to authenticate server with Firebase:', err);
  }
}
