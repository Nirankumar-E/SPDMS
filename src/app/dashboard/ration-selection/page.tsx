'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ShoppingCart, CheckCircle } from 'lucide-react';

export default function RationSelectionPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Ration Selection & Time Slot Booking
          </CardTitle>
          <CardDescription>
            Select your monthly ration items and book a collection slot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Your Ration Card Details
            </h3>
            <div className="p-4 bg-gray-50 rounded-md border text-sm space-y-1">
              <p>
                <strong>Card Number:</strong> ***********1234
              </p>
              <p>
                <strong>Card Type:</strong> PHH
              </p>
              <p>
                <strong>Head of Family:</strong> {user.displayName || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Select Your Ration Items for
              this Month
            </h3>
            <div className="p-4 border rounded-md space-y-2">
              <p>Rice: 20kg</p>
              <p>Sugar: 1kg</p>
              <p>Kerosene: 1L</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Choose Collection Slot
            </h3>
            <div className="p-4 border rounded-md">
              <p>Date and time selection functionality will be here.</p>
            </div>
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700">
            <CheckCircle className="mr-2 h-5 w-5" />
            Confirm Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
