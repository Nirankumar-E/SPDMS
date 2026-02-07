
'use client';

import { useDashboard } from '../layout';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Store, MapPin, Clock, ArrowLeft, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

interface ShopData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  district: string;
  timings?: {
    weekdays: string;
    weekends: string;
  };
}

export default function ShopDetailsPage() {
  const { citizen } = useDashboard();
  const firestore = useFirestore();
  const { i18n } = useLanguage();
  const shopI18n = i18n.shopDetails;

  const shopDocRef = useMemoFirebase(() => {
    if (!firestore || !citizen?.fpsCode) return null;
    return doc(firestore, 'shops', citizen.fpsCode);
  }, [firestore, citizen?.fpsCode]);

  const { data: shop, isLoading } = useDoc<ShopData>(shopDocRef);

  if (!citizen) return null;

  // Fallback data if shop document doesn't exist yet
  const fallbackShop = {
    code: citizen.fpsCode,
    name: `Fair Price Shop - ${citizen.district}`,
    address: `No. 12, Main Road, Near Primary School, ${citizen.district}, Tamil Nadu - 600001`,
    latitude: 13.0827,
    longitude: 80.2707,
    timings: {
      weekdays: "09:00 AM - 01:00 PM, 02:00 PM - 06:00 PM",
      weekends: "09:00 AM - 01:00 PM"
    }
  };

  const displayShop = shop || fallbackShop;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft /></Link>
          </Button>
          <h2 className="text-2xl font-bold text-primary font-headline">{shopI18n.title}</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-t-4 border-primary">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{displayShop.name}</CardTitle>
                    <CardDescription>{shopI18n.shopCode}: {citizen.fpsCode}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{shopI18n.address}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{displayShop.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{shopI18n.timings}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">{shopI18n.weekdays}:</span> {displayShop.timings?.weekdays || fallbackShop.timings.weekdays}</p>
                      <p><span className="font-medium">{shopI18n.weekends}:</span> {displayShop.timings?.weekends || fallbackShop.timings.weekends}</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${displayShop.latitude},${displayShop.longitude}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {shopI18n.location}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg overflow-hidden border-t-4 border-primary">
              <div className="aspect-square bg-gray-100 relative flex items-center justify-center group cursor-pointer">
                  <div className="text-center p-6">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
                    <p className="text-sm font-medium text-gray-500">{shopI18n.location}</p>
                    <p className="text-xs text-gray-400 mt-2">{displayShop.latitude}° N, {displayShop.longitude}° E</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
