'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase SDKs.
 * 
 * This function handles different deployment environments:
 * 1. Firebase App Hosting: Automatically initializes if environment variables are detected.
 * 2. Vercel/Manual: Uses NEXT_PUBLIC_ environment variables if provided.
 * 3. Default: Falls back to the bundled firebaseConfig object.
 */
export function initializeFirebase() {
  // Prevent duplicate initialization
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;

  // Check if we are in an environment that supports zero-argument initialization (Firebase Hosting)
  // or if we should use the provided config object.
  const isFirebaseHosting = typeof process !== 'undefined' && (process.env.FIREBASE_CONFIG || process.env.X_FIREBASE_ID_TOKEN);

  if (isFirebaseHosting) {
    try {
      firebaseApp = initializeApp();
    } catch (e) {
      console.warn("Automatic Firebase initialization failed, falling back to config object.");
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    // In all other environments (Vercel, local dev), use the config object.
    // The config object itself is now reactive to NEXT_PUBLIC_ env vars.
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
