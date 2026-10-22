import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

const GENERIC = 'Something went wrong. Please try again.';

// Turns Firebase error codes into readable messages shown in error-auth.
export function authErrorMessage(error) {
  const code = error && typeof error === 'object' ? error.code : '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please use a different one.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/missing-password':
      return 'Password is required';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return (error && error.message) || GENERIC;
  }
}

export async function register(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, String(email).trim(), password);
    return cred.user;
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

export async function login(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, String(email).trim(), password);
    return cred.user;
  } catch (error) {
    throw new Error(authErrorMessage(error));
  }
}

export async function logout() {
  await signOut(auth);
}
