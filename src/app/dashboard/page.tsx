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
} from '@/components/ui/card';
import GovernmentEmblem from '@/components/icons/government-emblem';
import { LogOut, Users, FileText, MapPin, HomeIcon } from 'lucide-react';
import { useDashboard } from './layout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function DashboardPage() {
  const { citizen } = useDashboard();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('loggedInSmartCardNumber');
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
        {/* Header Card - Profile Info */}
        <Card className="shadow-lg border-t-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className='flex items-center gap-4'>
                <GovernmentEmblem className="h-16 w-16" />
                <div>
                    <CardTitle className="text-2xl text-primary font-headline">
                        {citizen.name}
                    </CardTitle>
                    <CardDescription>Head of Family Profile</CardDescription>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className='flex items-center gap-2 p-2 bg-white rounded border'>
                  <FileText className='h-4 w-4 text-primary'/> 
                  <span className='text-muted-foreground'>Card:</span> 
                  <span className='font-medium'>{citizen.id}</span>
                </div>
                <div className='flex items-center gap-2 p-2 bg-white rounded border'>
                  <Badge variant="outline" className="bg-primary/5">{citizen.cardType}</Badge>
                </div>
                <div className='flex items-center gap-2 p-2 bg-white rounded border'>
                  <MapPin className='h-4 w-4 text-primary'/> 
                  <span className='text-muted-foreground'>District:</span> 
                  <span className='font-medium'>{citizen.district}</span>
                </div>
                <div className='flex items-center gap-2 p-2 bg-white rounded border'>
                  <HomeIcon className='h-4 w-4 text-primary'/> 
                  <span className='text-muted-foreground'>FPS:</span> 
                  <span className='font-medium'>{citizen.fpsCode}</span>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Members Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className='flex items-center gap-2 text-xl'>
              <Users className="text-primary" /> Family Members
            </CardTitle>
            <CardDescription>List of members registered under this smart card.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
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
                {citizen.familyMembers.map((member: any) => (
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
      </div>
    </div>
  );
}
