'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import GovernmentEmblem from '@/components/icons/government-emblem';
import { User as UserIcon, LogOut, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [beneficiaryData, setBeneficiaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      if (user) {
        try {
          // Note: In a real app, you would have a way to link the auth user (UID)
          // to their beneficiary record. For this example, we assume the UID
          // is the document ID in the 'beneficiaries' collection.
          const docRef = doc(firestore, 'beneficiaries', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setBeneficiaryData(docSnap.data());
          } else {
            console.log('No such beneficiary document!');
            // You might want to handle this case, e.g., by signing the user out
            // or showing an error message.
          }
        } catch (error) {
          console.error('Error fetching beneficiary data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBeneficiaryData();
  }, [user, firestore]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isUserLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GovernmentEmblem className="h-20 w-20" />
          </div>
          <CardTitle className="text-2xl text-primary font-headline">
            My Profile
          </CardTitle>
          <CardDescription>Your PDS Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {beneficiaryData ? (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {beneficiaryData.name}</p>
              <p><strong>Smart Card No:</strong> {beneficiaryData.smartCardNumber}</p>
              <p><strong>Address:</strong> {beneficiaryData.address}</p>
              <p><strong>Phone Number:</strong> {beneficiaryData.phoneNumber}</p>
            </div>
          ) : (
             <p>Could not load your profile details.</p>
          )}

          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link href="/dashboard/ration-selection">
              <ShoppingCart className="h-5 w-5" />
              Ration Selection & Time Slot Booking
            </Link>
          </Button>

          <div className="border-t pt-4 flex justify-between items-center">
             <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>{user.phoneNumber}</span>
             </div>
             <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4"/>
                Logout
             </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
