'use client';

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Users, 
  Calendar, 
  Store, 
  History, 
  LogOut, 
  Building2 
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function AppSidebar() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { i18n } = useLanguage();
  const [smartCardNumber, setSmartCardNumber] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('loggedInSmartCardNumber');
    if (stored) setSmartCardNumber(stored);
  }, []);

  const citizenDocRef = useMemoFirebase(() => {
    if (!smartCardNumber || !firestore) return null;
    return doc(firestore, 'citizens', smartCardNumber);
  }, [smartCardNumber, firestore]);

  const { data: citizen } = useDoc(citizenDocRef);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('loggedInSmartCardNumber');
    setIsOpen(false);
    router.push('/login');
  };

  const menuItems = [
    { label: i18n.sidebarMenu.familyMembers, icon: Users, href: '/dashboard', badge: citizen?.familyMembers?.length },
    { label: i18n.sidebarMenu.myBookings, icon: Calendar, href: '/dashboard/ration-selection' },
    { label: i18n.sidebarMenu.shopDetails, icon: Store, href: '/dashboard/shop-details' },
    { label: i18n.sidebarMenu.transactions, icon: History, href: '/dashboard/transactions' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10">
          <Menu className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r-0">
        <div className="flex flex-col h-full bg-white">
          <SheetHeader className="p-6 bg-gray-50 border-b">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-xl font-bold text-primary">SPDMS</SheetTitle>
                <p className="text-xs text-muted-foreground">{i18n.sidebarMenu.menu}</p>
              </div>
            </div>
          </SheetHeader>

          {citizen && (
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {citizen.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{citizen.name}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">RC-{citizen.id}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary">
                        {item.label}
                      </span>
                    </div>
                    {item.badge !== undefined && (
                      <Badge variant="secondary" className="rounded-full px-2 h-5 text-[10px] bg-gray-100">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>

              <Separator className="my-6" />

              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 p-3"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                {i18n.sidebarMenu.logout}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
