
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboard } from '../layout';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  runTransaction, 
  doc, 
  query, 
  where, 
  documentId 
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  ShoppingCart, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  CreditCard,
  Info,
  Loader2,
  Download,
  Users
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn, formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/layout/header';
import { QRCodeSVG } from 'qrcode.react';

const SLOT_LIMIT = 16;
const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM"
];

const bookingSchema = z.object({
  date: z.date({ required_error: 'A date for pickup is required.' }),
  timeSlot: z.string({ required_error: 'Please select a time slot.' }),
  paymentMethod: z.enum(['cash', 'upi'], { required_error: 'Please select a payment method.' }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type Step = 'appointment' | 'items' | 'payment' | 'qr';

export default function RationSelectionPage() {
  const { citizen } = useDashboard();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { i18n } = useLanguage();
  const bookingI18n = i18n.booking;

  const [step, setStep] = useState<Step>('appointment');
  const [selectedItems, setSelectedItems] = useState<Record<string, { enabled: boolean; quantity: number }>>({});
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  const prices: Record<string, number> = {
    rawRice: 0,
    boiledRice: 0,
    wheat: 2,
    sugar: 25,
    palmOil: 25,
    toorDal: 30
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      paymentMethod: 'cash',
    }
  });

  const selectedDate = form.watch('date');

  // Generate slot document IDs for the selected shop and date
  const slotDocIds = useMemo(() => {
    if (!citizen?.fpsCode || !selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return TIME_SLOTS.map((_, idx) => `${citizen.fpsCode}_${dateStr}_slot${idx}`);
  }, [citizen?.fpsCode, selectedDate]);

  // Fetch slot availability in real-time
  const slotsQuery = useMemoFirebase(() => {
    if (!firestore || slotDocIds.length === 0) return null;
    return query(collection(firestore, 'fps_slots'), where(documentId(), 'in', slotDocIds));
  }, [firestore, slotDocIds]);

  const { data: slotCounts, isLoading: isLoadingSlots } = useCollection(slotsQuery);

  // Map fetched counts to slot strings
  const availabilityMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (slotCounts) {
      slotCounts.forEach((doc: any) => {
        // Find which slot index this document corresponds to
        const idx = slotDocIds.indexOf(doc.id);
        if (idx !== -1) {
          map[TIME_SLOTS[idx]] = doc.count || 0;
        }
      });
    }
    return map;
  }, [slotCounts, slotDocIds]);

  const normalizedAllocation = useMemo(() => {
    if (!citizen?.rationAllocation) return {};
    const alloc = { ...citizen.rationAllocation };
    if (alloc.rice) {
      const totalRice = parseInt(alloc.rice as string) || 20;
      alloc.rawRice = `${Math.floor(totalRice/2)} Kg`;
      alloc.boiledRice = `${Math.ceil(totalRice/2)} Kg`;
      delete alloc.rice;
    }
    return alloc;
  }, [citizen]);

  useEffect(() => {
    if (Object.keys(normalizedAllocation).length > 0 && Object.keys(selectedItems).length === 0) {
      const initial: Record<string, any> = {};
      Object.entries(normalizedAllocation).forEach(([key, val]) => {
        const qty = parseInt((val as string).split(' ')[0]) || 0;
        initial[key] = { enabled: true, quantity: qty };
      });
      setSelectedItems(initial);
    }
  }, [normalizedAllocation, selectedItems]);

  const totalAmount = useMemo(() => {
    return Object.entries(selectedItems).reduce((acc, [key, val]) => {
      if (val.enabled) {
        return acc + (prices[key] || 0) * val.quantity;
      }
      return acc;
    }, 0);
  }, [selectedItems]);

  const handleDownloadQR = () => {
    const svg = document.getElementById('collection-qr-code') as unknown as SVGGraphicsElement;
    if (!svg) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "QR code element not found."
      });
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const scaleFactor = 4;
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `TN-PDS-QR-${citizen?.id || 'unknown'}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Download error:", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate the image file."
      });
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (step !== 'payment') return;
    if (!citizen || !firestore) return;

    try {
      const dateStr = format(data.date, 'yyyy-MM-dd');
      const slotIndex = TIME_SLOTS.indexOf(data.timeSlot);
      const slotDocId = `${citizen.fpsCode}_${dateStr}_slot${slotIndex}`;
      const slotRef = doc(firestore, 'fps_slots', slotDocId);

      // Perform a transaction to ensure slot availability
      await runTransaction(firestore, async (transaction) => {
        const slotSnapshot = await transaction.get(slotRef);
        const currentCount = slotSnapshot.exists() ? slotSnapshot.data().count || 0 : 0;

        if (currentCount >= SLOT_LIMIT) {
          throw new Error('This slot is now full. Please select another time.');
        }

        // Update slot count
        transaction.set(slotRef, { count: currentCount + 1 }, { merge: true });

        // Create booking
        const finalItems = Object.entries(selectedItems)
          .filter(([_, val]) => val.enabled)
          .map(([key, val]) => ({
            name: key,
            quantity: val.quantity,
            unit: 'Kg'
          }));

        const qrContent = JSON.stringify({
          cardId: citizen.id,
          date: dateStr,
          slot: data.timeSlot,
          items: finalItems,
          total: totalAmount,
          payment: data.paymentMethod
        });

        const bookingsRef = doc(collection(firestore, 'citizens', citizen.id, 'bookings'));
        transaction.set(bookingsRef, {
          date: dateStr,
          timeSlot: data.timeSlot,
          status: 'Booked',
          items: finalItems,
          paymentMethod: data.paymentMethod,
          totalAmount,
          qrData: qrContent,
          createdAt: serverTimestamp()
        });

        setGeneratedQR(qrContent);
      });

      setStep('qr');
      toast({
        title: bookingI18n.success.title,
        description: bookingI18n.success.description,
      });

    } catch (error: any) {
      console.error('Booking transaction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message || bookingI18n.error,
      });
    }
  };

  const nextStep = () => {
    if (step === 'appointment') {
      const date = form.getValues('date');
      const slot = form.getValues('timeSlot');
      if (!date || !slot) {
        form.trigger(['date', 'timeSlot']);
        return;
      }
      // Double check slot is not full locally
      if (availabilityMap[slot] >= SLOT_LIMIT) {
        toast({
            variant: "destructive",
            title: "Slot Full",
            description: "Please select another time slot."
        });
        return;
      }
      setStep('items');
    } else if (step === 'items') {
      setTimeout(() => setStep('payment'), 50);
    }
  };

  const prevStep = () => {
    if (step === 'items') setStep('appointment');
    if (step === 'payment') setStep('items');
  };

  if (!citizen) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 py-8 max-w-4xl mx-auto">
        <Card className="w-full shadow-2xl overflow-hidden rounded-3xl border-none">
          <CardHeader className="bg-primary text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-headline flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                  {bookingI18n.title}
                </CardTitle>
                <CardDescription className="text-white/80 mt-2 text-base">
                  {bookingI18n.description}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20 rounded-full">
                <Link href="/dashboard"><ArrowLeft /></Link>
              </Button>
            </div>
          </CardHeader>

          <div className="flex bg-gray-50/50 border-b px-8 py-6 overflow-x-auto gap-4">
            {['appointment', 'items', 'payment', 'qr'].map((s, idx) => (
              <div key={s} className="flex items-center shrink-0">
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold shadow-sm transition-all",
                  step === s ? "bg-primary text-white scale-110" : "bg-white text-gray-400 border"
                )}>
                  {idx + 1}
                </div>
                <div className="ml-3">
                  <p className={cn(
                    "text-xs font-bold whitespace-nowrap uppercase tracking-wider",
                    step === s ? "text-primary" : "text-gray-400"
                  )}>
                    {bookingI18n.steps[s as keyof typeof bookingI18n.steps]}
                  </p>
                </div>
                {idx < 3 && <div className="h-px w-12 bg-gray-200 ml-4" />}
              </div>
            ))}
          </div>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {step === 'appointment' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-lg font-bold text-gray-700">{bookingI18n.form.dateLabel}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full justify-start pl-4 text-left font-medium h-14 rounded-2xl border-2 hover:border-primary transition-all',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                                    {field.value ? format(field.value, 'PPP') : <span>{bookingI18n.form.datePlaceholder}</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="timeSlot"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-lg font-bold text-gray-700">{bookingI18n.form.slotLabel}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDate}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-2 font-medium hover:border-primary transition-all">
                                  <SelectValue placeholder={bookingI18n.form.slotPlaceholder} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                {TIME_SLOTS.map((slot) => {
                                    const currentCount = availabilityMap[slot] || 0;
                                    const isFull = currentCount >= SLOT_LIMIT;
                                    return (
                                        <SelectItem key={slot} value={slot} disabled={isFull}>
                                            <div className="flex items-center justify-between w-full min-w-[200px]">
                                                <span>{slot}</span>
                                                <div className="flex items-center gap-1.5 ml-4">
                                                    <Users className={cn("h-3.5 w-3.5", isFull ? "text-destructive" : "text-primary")} />
                                                    <span className={cn("text-xs font-bold", isFull ? "text-destructive" : "text-gray-500")}>
                                                        {isFull ? "Full" : `${currentCount}/${SLOT_LIMIT}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                            {!selectedDate && <p className="text-[10px] text-muted-foreground font-medium">Select a date first to see availability.</p>}
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 'items' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center justify-between border-b pb-4">
                      <h3 className="font-bold text-2xl text-gray-800">{bookingI18n.allocationTitle}</h3>
                      <Badge variant="outline" className="text-primary border-primary px-4 py-1 rounded-full bg-primary/5">Eligible Limits</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(normalizedAllocation).map(([key, val]) => {
                        const maxQty = parseInt((val as string).split(' ')[0]) || 0;
                        return (
                          <div key={key} className={cn(
                            "flex items-center justify-between p-5 rounded-3xl border-2 transition-all",
                            selectedItems[key]?.enabled ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 bg-white"
                          )}>
                            <div className="flex items-center gap-5">
                              <Checkbox 
                                id={`check-${key}`}
                                checked={selectedItems[key]?.enabled}
                                onCheckedChange={(checked) => 
                                  setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], enabled: !!checked } }))
                                }
                                className="h-7 w-7 rounded-lg"
                              />
                              <div>
                                <label htmlFor={`check-${key}`} className="text-lg font-bold capitalize cursor-pointer block">
                                  {i18n.data.items[key] || key}
                                </label>
                                <p className="text-sm text-muted-foreground font-medium">Available: {val as string}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                  <Input 
                                    type="number"
                                    min={0}
                                    max={maxQty}
                                    value={selectedItems[key]?.quantity || 0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') e.preventDefault();
                                    }}
                                    onChange={(e) => {
                                      const v = Math.min(maxQty, Math.max(0, parseInt(e.target.value) || 0));
                                      setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], quantity: v } }));
                                    }}
                                    className="w-24 text-right h-12 rounded-xl font-bold pr-10 border-2"
                                    disabled={!selectedItems[key]?.enabled}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Kg</span>
                                </div>
                                {prices[key] > 0 && (
                                  <div className="text-right w-20">
                                    <p className="text-xs text-muted-foreground">Price</p>
                                    <p className="font-bold text-primary">{formatCurrency(prices[key])}/Kg</p>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="p-8 bg-primary rounded-3xl text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-1">{bookingI18n.form.total}</p>
                        <h4 className="text-5xl font-bold">{formatCurrency(totalAmount)}</h4>
                      </div>
                      <CreditCard className="h-24 w-24 text-white/10 absolute -right-4 -bottom-4 transform rotate-12" />
                      <div className="text-right relative z-10">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none py-2 px-4 rounded-full">Secure Transaction</Badge>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xl font-bold text-gray-800">{bookingI18n.form.paymentLabel}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <div className={cn(
                                "flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all",
                                field.value === 'cash' ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" : "hover:bg-gray-50 border-gray-100"
                              )} onClick={() => field.onChange('cash')}>
                                <div className="flex items-center gap-4">
                                  <RadioGroupItem value="cash" id="cash" className="h-6 w-6" />
                                  <div>
                                    <div className="font-bold text-lg">{i18n.data.payments.cash}</div>
                                    <p className="text-xs text-muted-foreground">Pay at the shop counter</p>
                                  </div>
                                </div>
                              </div>

                              <div className={cn(
                                "flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all",
                                field.value === 'upi' ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" : "hover:bg-gray-50 border-gray-100"
                              )} onClick={() => field.onChange('upi')}>
                                <div className="flex items-center gap-4">
                                  <RadioGroupItem value="upi" id="upi" className="h-6 w-6" />
                                  <div>
                                    <div className="font-bold text-lg">{i18n.data.payments.upi}</div>
                                    <p className="text-xs text-muted-foreground">BHIM, GPay, PhonePe, Paytm</p>
                                  </div>
                                </div>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 'qr' && generatedQR && (
                  <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in zoom-in-95 duration-700">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-primary relative z-10 transform hover:scale-105 transition-transform">
                        <QRCodeSVG id="collection-qr-code" value={generatedQR} size={220} level="H" includeMargin />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold border border-green-100">
                        <CheckCircle className="h-5 w-5" />
                        {bookingI18n.success.title}
                      </div>
                      <p className="text-gray-500 font-medium max-w-sm">{bookingI18n.form.qrInstructions}</p>
                    </div>
                    <div className="w-full max-w-sm space-y-4 pt-4">
                      <Button 
                        type="button" 
                        className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl text-lg font-bold shadow-lg" 
                        onClick={handleDownloadQR}
                      >
                        <Download className="mr-3 h-6 w-6" />
                        {bookingI18n.form.downloadQR}
                      </Button>
                      <Button type="button" variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-2" asChild>
                        <Link href="/dashboard/my-qr-codes">View All QR Codes</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {step !== 'qr' && (
                  <div className="flex items-center gap-6 pt-8">
                    {step !== 'appointment' && (
                      <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl text-lg font-bold text-gray-500" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-6 w-6" />
                        {bookingI18n.form.back}
                      </Button>
                    )}
                    
                    {step !== 'payment' ? (
                      <Button type="button" className="flex-1 h-14 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg" onClick={nextStep} disabled={isLoadingSlots}>
                        {isLoadingSlots ? <Loader2 className="animate-spin h-6 w-6" /> : bookingI18n.form.next}
                        {!isLoadingSlots && <ArrowRight className="ml-2 h-6 w-6" />}
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1 h-14 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin h-6 w-6" />
                            {bookingI18n.form.submitting}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-6 w-6" />
                            {bookingI18n.form.submit}
                          </div>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          {step === 'payment' && (
             <CardFooter className="bg-gray-50 p-6 flex justify-center text-center">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Info className="h-4 w-4" />
                  <p>Items selected here are final and will be reserved for your chosen date.</p>
                </div>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
