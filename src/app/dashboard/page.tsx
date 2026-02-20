
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
import { LogOut, Users, FileText, MapPin, HomeIcon, Milestone, CreditCard } from 'lucide-react';
import { useDashboard } from './layout';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/layout/header';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { citizen } = useDashboard();
  const auth = useAuth();
  const router = useRouter();
  const { i18n } = useLanguage();
  const profileI18n = i18n.profile;

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('loggedInSmartCardNumber');
    router.push('/login');
  };

  if (!citizen) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  const infoItems = [
    {
      label: profileI18n.cardNumber,
      value: citizen.id,
      icon: FileText,
    },
    {
      label: profileI18n.cardType,
      value: citizen.cardType,
      icon: CreditCard,
      isBadge: true,
    },
    {
      label: profileI18n.district,
      value: citizen.district,
      icon: MapPin,
    },
    {
      label: profileI18n.taluk,
      value: citizen.taluk || profileI18n.notAvailable,
      icon: Milestone,
    },
    {
      label: profileI18n.fpsCode,
      value: citizen.fpsCode,
      icon: HomeIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header Card - Profile Info */}
        <Card className="shadow-lg border-t-4 border-primary overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 bg-white">
            <div className='flex items-center gap-4'>
                <GovernmentEmblem className="h-16 w-16" />
                <div>
                    <CardTitle className="text-2xl text-primary font-headline">
                        {citizen.name}
                    </CardTitle>
                    <CardDescription>{profileI18n.subtitle}</CardDescription>
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 hover:bg-destructive hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              {i18n.header.logout}
            </Button>
          </CardHeader>
          <CardContent className="bg-gray-50/50 p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {infoItems.map((item, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center gap-3 p-3 bg-white rounded-xl border shadow-sm h-full transition-all hover:shadow-md",
                      index === 4 && "col-span-2 md:col-span-1" // Make the last item span 2 on very small screens if needed
                    )}
                  >
                    <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                      <item.icon className='h-4 w-4 text-primary'/>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className='text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1 whitespace-nowrap'>
                        {item.label}
                      </span>
                      {item.isBadge ? (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 w-fit text-[11px] py-0 px-2">
                          {item.value}
                        </Badge>
                      ) : (
                        <span className='font-bold text-gray-900 text-sm whitespace-nowrap truncate'>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Family Members Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-50/50">
            <CardTitle className='flex items-center gap-2 text-xl'>
              <Users className="text-primary" /> {profileI18n.familyMembers.title}
            </CardTitle>
            <CardDescription>{profileI18n.familyMembers.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{profileI18n.familyMembers.name}</TableHead>
                  <TableHead>{profileI18n.familyMembers.relation}</TableHead>
                  <TableHead>{profileI18n.familyMembers.age}</TableHead>
                  <TableHead>{profileI18n.familyMembers.gender}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {citizen.familyMembers.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{i18n.data.relations[member.relation] || member.relation}</TableCell>
                    <TableCell>{member.age}</TableCell>
                    <TableCell>{i18n.data.genders[member.gender] || member.gender}</TableCell>
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
