
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import GovernmentEmblem from '@/components/icons/government-emblem';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase/provider';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface UserProfile {
    username: string;
    smartCardNumber: string;
    aadhaarNumber: string;
    phoneNumber: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (userLoading) {
        return; // Wait until user auth state is resolved
    }
    if (!user) {
        router.push('/login');
        return;
    }

    const fetchUserProfile = async () => {
        setLoadingProfile(true);
        const q = query(collection(firestore, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            setUserProfile(querySnapshot.docs[0].data() as UserProfile);
        } else {
            console.error("No user profile found for UID:", user.uid);
            // Optional: handle case where user is authenticated but profile is missing
        }
        setLoadingProfile(false);
    };

    fetchUserProfile();

  }, [user, userLoading, router, firestore]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };

  const isLoading = userLoading || loadingProfile;

  if (isLoading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <p>Loading Your Profile...</p>
        </div>
    )
  }

  if (!user) {
    // This should be handled by the effect, but as a fallback
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <GovernmentEmblem className="mb-4 h-20 w-20" />
          </div>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Welcome, {userProfile?.username || 'Citizen'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-left space-y-2">
          {userProfile ? (
            <>
                <p><strong>Username:</strong> {userProfile.username}</p>
                <p><strong>Smart Card Number:</strong> {userProfile.smartCardNumber}</p>
                <p><strong>Aadhaar Number (Masked):</strong> {userProfile.aadhaarNumber}</p>
                <p><strong>Registered Mobile:</strong> +91-******{userProfile.phoneNumber.slice(-4)}</p>
                <p><strong>User ID:</strong> {user.uid}</p>
            </>
          ) : (
            <p>Could not load profile details.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} className="w-full" variant="destructive">
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
