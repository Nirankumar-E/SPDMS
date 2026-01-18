'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, createContext, useContext, ReactNode } from 'react';
import { doc } from 'firebase/firestore';

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

  // Create a stable document reference
  const citizenDocRef = user ? doc(firestore, 'citizens', user.uid) : null;
  const { data: citizen, isLoading: isCitizenLoading, error } = useDoc<Citizen>(citizenDocRef);

  useEffect(() => {
    // If auth is done and there's no user, redirect to login
    if (!isAuthLoading && !user) {
      router.replace('/login');
      return;
    }

    // If we have a user but fetching their citizen data fails (e.g., permissions)
    if (error) {
        console.error("Error fetching citizen data:", error);
        // Handle error appropriately, maybe sign out and redirect
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
