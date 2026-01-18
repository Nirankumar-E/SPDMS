'use client';

import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, createContext, useContext, ReactNode, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';

// Define the shape of the citizen data based on your Firestore structure
interface Citizen {
  id: string;
  smartCardNumber: string;
  name: string;
  cardType: string;
  fpsCode: string;
  district: string;
  profileCompleted: boolean;
  familyMembers: { id: string; name: string; age: number; gender: string; relation: string }[];
  rationAllocation: { [key: string]: string };
  [key: string]: any; // Allow other properties
}

interface DashboardContextType {
  citizen: Citizen | null;
  isLoading: boolean;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardLayout');
  }
  return context;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

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
  const citizenQuery = useMemoFirebase(() => {
    if (!firestore || !smartCardNumber) return null;
    return query(collection(firestore, 'citizens'), where('smartCardNumber', '==', smartCardNumber));
  }, [firestore, smartCardNumber]);

  const { data: citizenData, isLoading: isCitizenLoading, error } = useCollection<Citizen>(citizenQuery);

  // Since useCollection returns an array, we get the first (and only) result.
  const citizen = (citizenData && citizenData.length > 0) ? citizenData[0] : null;

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
        router.replace('/login');
        return;
    }

    // Once we have the citizen data, check if profile is complete
    if (citizen) {
      if (!citizen.profileCompleted) {
        router.replace('/profile-setup');
      }
    }
  }, [user, isAuthLoading, citizen, error, router]);

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
    <DashboardContext.Provider value={{ citizen, isLoading }}>
      {children}
    </DashboardContext.Provider>
  );
}
