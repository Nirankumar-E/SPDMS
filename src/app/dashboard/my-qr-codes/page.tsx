
'use client';

import { useDashboard } from '../layout';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode, ArrowLeft, Calendar, Clock, ShoppingBag, CreditCard, Inbox, ShoppingCart, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { QRCodeSVG } from 'qrcode.react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import { formatCurrency, cn } from '@/lib/utils';

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="shadow-lg hover:shadow-xl transition-all border-l-4 border-primary rounded-2xl overflow-hidden bg-white">
                <CardHeader className="pb-2 bg-primary/5">
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
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={booking.status === 'Booked' ? 'default' : 'secondary'} className="rounded-full">
                        {booking.status}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "text-[10px] py-0",
                        booking.paymentStatus === 'Completed' ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"
                      )}>
                        {i18n.data.paymentStatus[booking.paymentStatus] || booking.paymentStatus}
                      </Badge>
                    </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex justify-center bg-white p-4 rounded-3xl border-2 border-dashed border-gray-100 shadow-inner group relative">
                    {/* The QR data is the verification URL, making it dynamic */}
                    <QRCodeSVG value={booking.qrData} size={140} level="H" />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl">
                       <Button size="sm" variant="default" className="rounded-full shadow-lg" asChild>
                          <Link href={`/verify-booking/${citizen.id}/${booking.id}`}>
                             <ExternalLink className="h-3 w-3 mr-1" />
                             {qrI18n.verification}
                          </Link>
                       </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span className="font-medium">{booking.items?.length || 0} {i18n.transactions.items}</span>
                      </div>
                      <div className="font-bold text-lg text-primary">{formatCurrency(booking.totalAmount)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                      <CreditCard className="h-3 w-3" />
                      <span>{i18n.data.payments[booking.paymentMethod] || booking.paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-16 text-center shadow-xl bg-white border-dashed border-2 rounded-3xl flex flex-col items-center justify-center space-y-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <Inbox className="h-16 w-16 text-gray-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">{qrI18n.noHistory}</h3>
              <p className="text-gray-500 max-w-sm mx-auto">You haven't made any ration collection bookings yet. Book a slot to get your collection QR code.</p>
            </div>
            <Button asChild className="mt-6 h-12 px-8 rounded-full" variant="default">
              <Link href="/dashboard/ration-selection">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {i18n.sidebarMenu.myBookings}
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
