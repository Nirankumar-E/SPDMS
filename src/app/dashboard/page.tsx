'use client';

import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import GovernmentEmblem from '@/components/icons/government-emblem';
import { User, LogOut, ShoppingCart, Users, FileText, MapPin, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useDashboard } from './layout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function DashboardPage() {
  const { citizen } = useDashboard();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (!citizen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className='flex items-center gap-4'>
                <GovernmentEmblem className="h-16 w-16" />
                <div>
                    <CardTitle className="text-2xl text-primary font-headline">
                        {citizen.name}
                    </CardTitle>
                    <CardDescription>Citizen Dashboard</CardDescription>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className='flex items-center gap-2'><FileText className='h-4 w-4'/> Smart Card: <span className='font-medium text-foreground'>{citizen.smartCardNumber}</span></div>
                <div className='flex items-center gap-2'><Badge variant="outline">{citizen.cardType}</Badge></div>
                <div className='flex items-center gap-2'><MapPin className='h-4 w-4'/> District: <span className='font-medium text-foreground'>{citizen.district}</span></div>
                <div className='flex items-center gap-2'><HomeIcon className='h-4 w-4'/> FPS Code: <span className='font-medium text-foreground'>{citizen.fpsCode}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Ration Selection Card */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Ration Services</CardTitle>
            </CardHeader>
            <CardContent>
                 <Button asChild className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                    <Link href="/dashboard/ration-selection">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Ration Selection & Time Slot Booking
                    </Link>
                </Button>
            </CardContent>
        </Card>


        {/* Family Members Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><Users /> Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relation</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizen.familyMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.relation}</TableCell>
                    <TableCell>{member.age}</TableCell>
                    <TableCell>{member.gender}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Monthly Ration Allocation Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className='flex items-center gap-2'><ShoppingCart/> Monthly Ration Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(citizen.rationAllocation).map(([item, quantity]) => (
                <div key={item} className="p-4 bg-gray-50 rounded-lg border">
                  <p className="font-semibold capitalize">{item}</p>
                  <p className="text-lg text-primary">{quantity}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
