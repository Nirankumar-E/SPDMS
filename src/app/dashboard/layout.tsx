
'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DashboardProvider, CitizenDocument } from '@/lib/dashboard-context';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [smartCardNumber, setSmartCardNumber] = useState<string | null>(null);

  // On the client, retrieve the smart card number from localStorage.
  useEffect(() => {
    const storedCardNumber = localStorage.getItem('loggedInSmartCardNumber');
    if (storedCardNumber) {
      setSmartCardNumber(storedCardNumber);
    } else if (!isAuthLoading && !user) {
      // If there's no stored card number and we're not loading auth, and there's no user,
      // then they likely haven't logged in. Redirect them.
      router.replace('/login');
    }
  }, [isAuthLoading, user, router]);


  // Create a memoized query to fetch citizen data based on the smart card number
  const citizenDocRef = useMemoFirebase(() => {
    if (!firestore || !smartCardNumber) return null;
    return doc(firestore, 'citizens', smartCardNumber);
  }, [firestore, smartCardNumber]);

  const { data: citizen, isLoading: isCitizenLoading, error } = useDoc<CitizenDocument>(citizenDocRef);

  useEffect(() => {
    // If auth is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      localStorage.removeItem('loggedInSmartCardNumber');
      router.replace('/login');
      return;
    }

    // If we have a user but fetching their citizen data fails
    if (error) {
        console.error("Error fetching citizen data:", error);
        // This could be a permission error if rules are strict.
        // Or the document just doesn't exist.
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch your profile data."
        })
        router.replace('/login');
        return;
    }

    // Once we have the citizen data, check if profile is complete
    if (citizen) {
      if (!citizen.profileCompleted) {
        router.replace('/profile-setup');
      }
    }
  }, [user, isAuthLoading, citizen, error, router, toast]);

  const isLoading = isAuthLoading || isCitizenLoading;

  // Show a loading screen while we verify auth and fetch data
  if (isLoading || !citizen || !citizen.profileCompleted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  // If profile is complete, render the dashboard pages
  return (
    <DashboardProvider value={{ citizen, isLoading }}>
      {children}
    </DashboardProvider>
  );
}
