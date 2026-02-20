'use client';

import { useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ShoppingBag, CreditCard, User, Loader2, PackageCheck, Info, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';
import { formatCurrency, cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function VerifyBookingPage() {
  const params = useParams();
  const citizenId = params.citizenId as string;
  const bookingId = params.bookingId as string;
  const firestore = useFirestore();
  const { i18n } = useLanguage();
  const { toast } = useToast();
  const vI18n = i18n.verification;

  const [isUpdating, setIsUpdating] = useState(false);

  const bookingDocRef = useMemoFirebase(() => {
    if (!firestore || !citizenId || !bookingId) return null;
    return doc(firestore, 'citizens', citizenId, 'bookings', bookingId);
  }, [firestore, citizenId, bookingId]);

  const citizenDocRef = useMemoFirebase(() => {
    if (!firestore || !citizenId) return null;
    return doc(firestore, 'citizens', citizenId);
  }, [firestore, citizenId]);

  const { data: booking, isLoading: isBookingLoading } = useDoc<any>(bookingDocRef);
  const { data: citizen, isLoading: isCitizenLoading } = useDoc<any>(citizenDocRef);

  const handleConsumeRation = async () => {
    if (!firestore || !bookingDocRef || !booking) return;

    setIsUpdating(true);
    try {
      // QNS IMPLEMENTATION: Transaction-based single-use update
      await runTransaction(firestore, async (transaction) => {
        const snap = await transaction.get(bookingDocRef);
        if (!snap.exists()) throw new Error("Booking not found");
        
        const data = snap.data();
        if (data.status === 'Collected') {
          throw new Error("This ration has already been collected.");
        }

        transaction.update(bookingDocRef, {
          status: 'Collected',
          collectedAt: serverTimestamp()
        });
      });

      toast({
        title: "Success",
        description: "Ration distribution recorded successfully.",
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: "Distribution Error",
        description: err.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = isBookingLoading || isCitizenLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
           <div className="space-y-4 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-gray-500 font-medium">{vI18n.loading}</p>
           </div>
        </div>
      </div>
    );
  }

  if (!booking || !citizen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
           <Card className="max-w-md w-full text-center p-12 space-y-4 shadow-xl border-dashed border-2">
              <div className="bg-red-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                 <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{vI18n.notFound}</h2>
              <p className="text-gray-500">The scanned QR code is invalid or the booking has been deleted.</p>
           </Card>
        </div>
      </div>
    );
  }

  const isAlreadyCollected = booking.status === 'Collected';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Badge className={cn(
            "px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-in zoom-in-95",
            isAlreadyCollected ? "bg-amber-500" : "bg-green-600"
          )}>
             {isAlreadyCollected ? <AlertCircle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
             {isAlreadyCollected ? "Already Collected" : vI18n.verifiedStatus}
          </Badge>
          <h1 className="text-3xl font-headline font-bold text-gray-900">{vI18n.title}</h1>
          <p className="text-gray-500">{vI18n.subtitle}</p>
        </div>

        {/* Real-time Status Banner */}
        <div className={cn(
          "p-6 rounded-3xl border-2 flex items-center justify-between shadow-sm transition-colors",
          isAlreadyCollected ? "bg-amber-50 border-amber-200" : "bg-primary/5 border-primary/20"
        )}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-inner flex items-center justify-center text-primary">
               {isAlreadyCollected ? <PackageCheck className="h-6 w-6 text-amber-500" /> : <Clock className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collection Status</p>
              <h4 className={cn("text-xl font-bold", isAlreadyCollected && "text-amber-700")}>{booking.status}</h4>
            </div>
          </div>
          <div className="text-right">
             <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slot</p>
             <h4 className="text-lg font-bold">{booking.timeSlot}</h4>
          </div>
        </div>

        {isAlreadyCollected && (
          <div className="bg-amber-100 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-800">
            <Info className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">This ration was collected on {booking.collectedAt?.toDate().toLocaleString() || 'previously recorded date'}.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
           {/* Purchaser Info */}
           <Card className="shadow-lg rounded-3xl overflow-hidden border-none">
              <CardHeader className="bg-gray-50/50 pb-4 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {vI18n.purchaserInfo}
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{i18n.profile.familyMembers.name}</p>
                    <p className="font-bold text-lg">{citizen.name}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{i18n.profile.cardNumber}</p>
                    <p className="font-mono text-lg">{citizen.id}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{i18n.profile.district}</p>
                    <p className="font-medium">{citizen.district}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{i18n.profile.taluk}</p>
                    <p className="font-medium">{citizen.taluk || i18n.profile.notAvailable}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{i18n.profile.cardType}</p>
                    <Badge variant="outline">{citizen.cardType}</Badge>
                 </div>
              </CardContent>
           </Card>

           {/* Items Details */}
           <Card className="shadow-lg rounded-3xl overflow-hidden border-none">
              <CardHeader className="bg-gray-50/50 pb-4 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    {vI18n.itemsDetails}
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                 <div className="space-y-2">
                    {booking.items.map((item: any) => (
                       <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                          <span className="font-bold capitalize">{i18n.data.items[item.name] || item.name}</span>
                          <span className="font-mono text-primary font-bold">{item.quantity} {item.unit}</span>
                       </div>
                    ))}
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xl font-bold">{i18n.booking.form.total}</span>
                    <span className="text-3xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</span>
                 </div>
              </CardContent>
           </Card>

           {/* Payment Details */}
           <Card className="shadow-lg rounded-3xl overflow-hidden border-none">
              <CardHeader className="bg-gray-50/50 pb-4 border-b">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    {vI18n.paymentDetails}
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                       <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="font-bold">{i18n.data.payments[booking.paymentMethod] || booking.paymentMethod}</p>
                       <p className="text-xs text-gray-400">ID: {booking.id.substring(0, 12)}</p>
                    </div>
                 </div>
                 <Badge variant={booking.paymentStatus === 'Completed' ? 'default' : 'secondary'} className={cn(
                    "px-4 py-1 rounded-full",
                    booking.paymentStatus === 'Completed' ? "bg-green-600" : "bg-amber-500"
                 )}>
                    {i18n.data.paymentStatus[booking.paymentStatus] || booking.paymentStatus}
                 </Badge>
              </CardContent>
           </Card>

           {/* Shopkeeper Action: QNS Distribution Lock */}
           {!isAlreadyCollected && (
             <Button 
               className="w-full h-16 rounded-3xl text-xl font-bold shadow-xl bg-primary hover:bg-primary/90"
               onClick={handleConsumeRation}
               disabled={isUpdating}
             >
               {isUpdating ? <Loader2 className="animate-spin h-6 w-6" /> : "Confirm Distribution & Mark Collected"}
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}
