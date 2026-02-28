
'use client';

import { createContext, useContext, ReactNode } from 'react';

/**
 * Represents the raw data of a citizen document in Firestore.
 */
export interface CitizenDocument {
  name: string;
  cardType: string;
  fpsCode: string;
  district: string;
  taluk?: string;
  profileCompleted: boolean;
  familyMembers: { id: string; name: string; age: number; gender: string; relation: string }[];
  rationAllocation: { [key: string]: string };
  lastBookingMonth?: string;
  [key: string]: any;
}

/**
 * Represents a citizen document with its Firestore ID.
 */
export interface Citizen extends CitizenDocument {
  id: string;
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

export function DashboardProvider({ children, value }: { children: ReactNode, value: DashboardContextType }) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
