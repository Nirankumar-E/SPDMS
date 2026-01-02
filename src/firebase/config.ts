// @ts-nocheck
// This file is not intended to be edited.
//
// To change the configuration for this project, it is recommended to use
// the Firebase Studio UI.
import { FirebaseOptions, initializeApp } from 'firebase/app';

const firebaseConfig: FirebaseOptions = JSON.parse(
  process.env.NEXT_PUBLIC_FIREBASE_CONFIG || '{}'
);

// This is a browser-only initialization.
// This should not be used in server-side code.
export const app = initializeApp(firebaseConfig);
