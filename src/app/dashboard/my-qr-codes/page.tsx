
'use client';

import { useDashboard } from '../layout';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, ArrowLeft, Calendar, Clock, ShoppingBag, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyQRCodesPage() {
  const { citizen } = useDashboard();
  const firestore = useFirestore();
  const { i18n } = useLanguage();
  const qrI18n = i18n.qrHistory;

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !citizen) return null;
    return query(
      collection(firestore, 'citizens', citizen.id, 'bookings'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, citizen]);

  const { data: bookings, isLoading } = useCollection(bookingsQuery);

  if (!citizen) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard"><ArrowLeft /></Link>
          </Button>
          <h2 className="text-2xl font-bold text-primary font-headline">{qrI18n.title}</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="shadow-lg hover:shadow-xl transition-all border-l-4 border-primary">
                <CardHeader className="pb-2">
                   <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {booking.date}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {booking.timeSlot}
                      </CardDescription>
                    </div>
                    <Badge variant={booking.status === 'Booked' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center bg-white p-3 rounded-xl border-2 border-dashed border-gray-200">
                    <QRCodeSVG value={booking.qrData} size={120} />
                  </div>
                  
                  <div className="space-y-2 text-sm border-t pt-3">
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>{booking.items?.length || 0} {i18n.transactions.items}</span>
                      </div>
                      <div className="font-bold text-primary">₹ {booking.totalAmount}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span>{i18n.data.payments[booking.paymentMethod] || booking.paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center shadow-inner bg-gray-50 border-dashed border-2">
            <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{qrI18n.noHistory}</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/dashboard/ration-selection">{i18n.sidebarMenu.myBookings}</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
