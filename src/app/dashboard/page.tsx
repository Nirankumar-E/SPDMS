
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

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/login');
  };
  
  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center">
            <GovernmentEmblem className="mb-4 h-20 w-20" />
          </div>
          <CardTitle>Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            You have successfully logged in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is your citizen dashboard. Your user ID is: {user.uid}</p>
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
