"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import GovernmentEmblem from '@/components/icons/government-emblem';
import Link from 'next/link';
import { LogIn, User, LogOut } from 'lucide-react';
import { useUser, useAuth } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [language, setLanguage] = useState<'TA' | 'EN'>('TA');
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if(auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-1">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="text-xs md:text-sm">
            <span>Helpline: </span>
            <a href="tel:1967" className="hover:underline">1967</a> | <a href="tel:18004255901" className="hover:underline">1800-425-5901</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/80" onClick={() => setLanguage('TA')}>தமிழ்</Button>
                <span className="text-sm">|</span>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/80" onClick={() => setLanguage('EN')}>English</Button>
            </div>
             <div className="border-l border-primary-foreground/50 h-6"></div>
             {loading ? (
              <div className="h-7 w-24 bg-primary/80 rounded-md animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/80 flex items-center gap-1" asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                </Button>
                <span className="text-sm">|</span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 px-2 text-xs hover:bg-primary/80 flex items-center gap-1">
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/80 flex items-center gap-1" asChild>
                <Link href="/login">
                  <LogIn className="h-4 w-4" /> Citizen Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <GovernmentEmblem className="h-16 w-16" />
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-primary font-headline">
              {language === 'TA' ? 'பொது விநியோகத் திட்டம்' : 'Public Distribution System'}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {language === 'TA' ? 'தமிழ்நாடு அரசு' : 'Government of Tamil Nadu'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
