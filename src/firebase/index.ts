// This file is not intended to be edited.
import {
  ComponentWithChildren,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';

import { app } from '@/firebase/config';

import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import {
  FirebaseApp,
  FirebaseProvider,
} from './provider';
import { FirebaseClientProvider } from './client-provider';


import { useUser } from './auth/use-user';
import { useDoc } from './firestore/use-doc';
import { useCollection } from './firestore/use-collection';

// Creating a singleton instance of the Firebase app.
const firebaseApp = app;
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export function initializeFirebase() {
  return {
    firebaseApp,
    auth,
    firestore,
  };
}

export {
  useUser,
  useDoc,
  useCollection,
  FirebaseProvider,
  FirebaseClientProvider,
};
