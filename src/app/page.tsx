'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import LeftSidebar from '@/components/layout/left-sidebar';
import MainContent from '@/components/layout/main-content';
import RightSidebar from '@/components/layout/right-sidebar';
import HelplineBar from '@/components/layout/helpline-bar';
import MobileAppBanner from '@/components/layout/mobile-app-banner';
import Footer from '@/components/layout/footer';
import { translations, Language } from '@/lib/i18n';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [language, setLanguage] = useState<Language>('TA');
  const i18n = translations[language];
  const { user, loading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [smartCardNumber, setSmartCardNumber] = useState<string | null>(null);

  useEffect(() => {
    const storedCardNumber = localStorage.getItem('loggedInSmartCardNumber');
    if (storedCardNumber) {
      setSmartCardNumber(storedCardNumber);
    }
  }, []);

  const citizenDocRef = useMemoFirebase(() => {
    if (!firestore || !smartCardNumber) return null;
    return doc(firestore, 'citizens', smartCardNumber);
  }, [firestore, smartCardNumber]);

  const { data: citizen, isLoading: isCitizenLoading } = useDoc(citizenDocRef);

  const isLoggedIn = !!user && !!citizen;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        i18n={i18n.header}
      />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-2 order-2 lg:order-1">
            <LeftSidebar i18n={i18n.leftSidebar} />
          </aside>
          
          <section className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            {isLoggedIn ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-primary font-headline">
                  Welcome, {citizen.name}
                </h2>
                
                {/* Ration Services Section */}
                <Card className="shadow-lg border-l-4 border-green-600">
                  <CardHeader>
                    <CardTitle className="text-xl">Ration Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-muted-foreground">Manage your ration collection and bookings.</p>
                      <Button asChild className="w-full md:w-max bg-green-600 hover:bg-green-700">
                        <Link href="/dashboard/ration-selection">
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Ration Selection & Time Slot Booking
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Ration Allocation Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Monthly Ration Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(citizen.rationAllocation).map(([item, quantity]) => (
                        <div key={item} className="p-4 bg-gray-50 rounded-lg border flex flex-col items-center text-center">
                          <p className="font-semibold capitalize text-sm text-gray-600">{item}</p>
                          <p className="text-lg font-bold text-primary">{(quantity as string)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <MainContent i18n={i18n.mainContent} />
            )}
          </section>

          <aside className="lg:col-span-3 order-3">
            <RightSidebar i18n={i18n.rightSidebar} />
          </aside>
        </div>
      </main>
      <HelplineBar i18n={i18n.helpline} />
      <MobileAppBanner i18n={i18n.mobileApp} />
      <Footer i18n={i18n.footer} />
    </div>
  );
}
