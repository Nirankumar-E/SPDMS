// This file is not intended to be edited.
'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  DocumentData,
  query,
  where,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';

export function useCollection<T>(path: string, field?: string, value?: any) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q: Query<DocumentData>;

    if (field && value) {
      q = query(collection(firestore, path), where(field, '==', value));
    } else {
      q = query(collection(firestore, path));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(docs);
          setLoading(false);
        } catch (e: any) {
          setError(e);
          setLoading(false);
        }
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, field, value]);

  return { data, loading, error };
}
