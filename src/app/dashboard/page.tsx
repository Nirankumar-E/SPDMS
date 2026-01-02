'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import GovernmentEmblem from '@/components/icons/government-emblem';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement actual Firebase logout
    router.push('/login');
  };

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
          <p>This is your citizen dashboard. More features coming soon!</p>
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
