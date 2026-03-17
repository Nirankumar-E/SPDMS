
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboard } from '@/lib/dashboard-context';
import { 
  useFirestore, 
  useAuth, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase';
import { 
  collection, 
  query, 
  where,
  doc,
  runTransaction,
  serverTimestamp,
  orderBy,
  getDoc
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Loader2,
  Download,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { QRCodeSVG } from 'qrcode.react';
import { Progress } from '@/components/ui/progress';
import Header from '@/components/layout/header';

const RZP_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!; 
const MAX_SLOT_CAPACITY = 16;

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
  const auth = useAuth();
  const { toast } = useToast();
  const { i18n } = useLanguage();
  const bookingI18n = i18n.booking;

  const [step, setStep] = useState<Step>('appointment');
  const [selectedItems, setSelectedItems] = useState<Record<string, { enabled: boolean; quantity: number }>>({});
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      paymentMethod: 'cash',
    }
  });

  const selectedDate = form.watch('date');

  const slotCountsQuery = useMemoFirebase(() => {
    if (!firestore || !citizen?.fpsCode || !selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return query(
      collection(firestore, 'fps_slots'),
      where('fpsCode', '==', citizen.fpsCode),
      where('date', '==', dateStr)
    );
  }, [firestore, citizen?.fpsCode, selectedDate]);

  const { data: slotCounts } = useCollection(slotCountsQuery);

  const getSlotStatus = useCallback((slot: string) => {
    const idx = TIME_SLOTS.indexOf(slot);
    if (!slotCounts || !selectedDate || !citizen?.fpsCode || idx === -1) return { count: 0, isFull: false };
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotId = `${citizen.fpsCode}_${dateStr}_${idx}`;
    const slotDoc = slotCounts.find(s => s.id === slotId);
    const count = slotDoc?.bookedCount || 0;
    return {
      count,
      isFull: count >= MAX_SLOT_CAPACITY
    };
  }, [slotCounts, selectedDate, citizen?.fpsCode]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById('razorpay-sdk')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const prices: Record<string, number> = {
    rawRice: 0,
    boiledRice: 0,
    wheat: 0,
    sugar: 25,
    palmOil: 25,
    toorDal: 30
  };

  const normalizedAllocation = useMemo(() => {
    if (!citizen?.rationAllocation) return {};
    return { ...citizen.rationAllocation };
  }, [citizen]);

  // Calculate monthly remaining quota
  const remainingQuotas = useMemo(() => {
    if (!citizen) return {};
    const currentMonth = format(new Date(), 'yyyy-MM');
    const usage = citizen.monthlyUsage?.[currentMonth] || {};
    
    const remaining: Record<string, number> = {};
    Object.entries(normalizedAllocation).forEach(([key, val]) => {
      const max = parseFloat((val as string).split(' ')[0]) || 0;
      const used = usage[key] || 0;
      remaining[key] = Math.max(0, max - used);
    });
    return remaining;
  }, [citizen, normalizedAllocation]);

  useEffect(() => {
    if (Object.keys(normalizedAllocation).length > 0 && Object.keys(selectedItems).length === 0) {
      const initial: Record<string, any> = {};
      Object.entries(remainingQuotas).forEach(([key, remaining]) => {
        initial[key] = { enabled: remaining > 0, quantity: remaining };
      });
      setSelectedItems(initial);
    }
  }, [remainingQuotas]);

  const totalAmount = useMemo(() => {
    return Object.entries(selectedItems).reduce((acc, [key, val]) => {
      if (val.enabled) {
        return acc + (prices[key] || 0) * val.quantity;
      }
      return acc;
    }, 0);
  }, [selectedItems]);

  const handleDownloadQR = useCallback(() => {
    const svg = document.getElementById('collection-qr-code') as unknown as SVGGraphicsElement;
    if (!svg) return;
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
          const downloadLink = document.createElement('a');
          downloadLink.download = `TN-PDS-QR-${citizen?.id || 'unknown'}.png`;
          downloadLink.href = canvas.toDataURL('image/png');
          downloadLink.click();
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error("Download error:", err);
    }
  }, [citizen?.id]);

  const completeBooking = useCallback(async (data: BookingFormValues, transactionId?: string) => {
    if (!citizen || !firestore || !auth.currentUser) return;

    setIsProcessingPayment(true);

    try {
      const dateStr = format(data.date, 'yyyy-MM-dd');
      const currentMonth = dateStr.substring(0, 7);
      const slotIndex = TIME_SLOTS.indexOf(data.timeSlot);
      
      const citizenRef = doc(firestore, 'citizens', citizen.id);
      const slotId = `${citizen.fpsCode}_${dateStr}_${slotIndex}`;
      const slotRef = doc(firestore, 'fps_slots', slotId);
      
      // Use a new document for every booking
      const bookingRef = doc(collection(firestore, 'citizens', citizen.id, 'bookings'));

      await runTransaction(firestore, async (transaction) => {
        const citizenSnap = await transaction.get(citizenRef);
        if (!citizenSnap.exists()) throw new Error("Citizen profile not found.");
        const citizenData = citizenSnap.data();
        
        const usage = citizenData.monthlyUsage?.[currentMonth] || {};
        
        const finalItems = Object.entries(selectedItems)
          .filter(([_, val]) => val.enabled && val.quantity > 0)
          .map(([key, val]) => ({
            name: key,
            quantity: val.quantity,
            unit: "Kg"
          }));

        if (finalItems.length === 0) throw new Error("Please select at least one item.");

        // Validate quotas again inside transaction
        finalItems.forEach(item => {
          const max = parseFloat((normalizedAllocation[item.name] as string).split(' ')[0]) || 0;
          const used = usage[item.name] || 0;
          if (used + item.quantity > max) {
            throw new Error(`Quota exceeded for ${item.name}. Remaining: ${max - used} Kg`);
          }
        });

        const slotSnap = await transaction.get(slotRef);
        let bookedCount = 0;
        if (slotSnap.exists()) {
          bookedCount = slotSnap.data().bookedCount || 0;
        }

        if (bookedCount >= MAX_SLOT_CAPACITY) {
          throw new Error("This time slot is full. Please select another time.");
        }

        // Update Usage Map
        const newUsage = { ...usage };
        finalItems.forEach(item => {
          newUsage[item.name] = (newUsage[item.name] || 0) + item.quantity;
        });

        transaction.update(citizenRef, {
          [`monthlyUsage.${currentMonth}`]: newUsage,
          lastBookingMonth: currentMonth
        });

        transaction.set(slotRef, {
          bookedCount: bookedCount + 1,
          maxCapacity: MAX_SLOT_CAPACITY,
          date: dateStr,
          timeSlot: data.timeSlot,
          fpsCode: citizen.fpsCode,
          updatedAt: serverTimestamp()
        }, { merge: true });

        const baseUrl = window.location.origin;
        const verifyUrl = `${baseUrl}/verify-booking/${citizen.id}/${bookingRef.id}`;

        transaction.set(bookingRef, {
          date: dateStr,
          month: currentMonth,
          timeSlot: data.timeSlot,
          slotIndex: slotIndex === -1 ? 0 : slotIndex,
          status: "Booked",
          paymentStatus: data.paymentMethod === 'upi' ? "Completed" : "Pending",
          items: finalItems,
          paymentMethod: data.paymentMethod,
          totalAmount: totalAmount || 0,
          transactionId: transactionId || null,
          qrData: verifyUrl,
          createdAt: serverTimestamp(),
          citizenName: citizen.name || "Unknown",
          district: citizen.district || "",
          taluk: citizen.taluk || "",
          fpsCode: citizen.fpsCode || ""
        });
      });

      setGeneratedQRUrl(`${window.location.origin}/verify-booking/${citizen.id}/${bookingRef.id}`);
      setStep('qr');

      toast({
        title: bookingI18n.success.title,
        description: bookingI18n.success.description,
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: error.message,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }, [citizen, firestore, auth, selectedItems, totalAmount, bookingI18n.success, toast, normalizedAllocation]);

  const onSubmit = async (data: BookingFormValues) => {
    if (step !== 'payment') return;
    if (!citizen) return;

    if (data.paymentMethod === 'upi' && totalAmount > 0) {
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        toast({ 
          variant: 'destructive', 
          title: 'Gateway Not Ready', 
          description: 'Payment SDK is still loading.' 
        });
        return;
      }
      setIsProcessingPayment(true);
      
      const options = {
        key: RZP_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "TN-PDS Portal",
        description: "Ration Collection Payment",
        handler: (response: any) => completeBooking(data, response.razorpay_payment_id),
        prefill: { name: citizen.name, contact: citizen.registeredMobile },
        theme: { color: "#1e3a8a" },
        modal: { ondismiss: () => setIsProcessingPayment(false) }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (e) {
        setIsProcessingPayment(false);
      }
    } else {
      completeBooking(data);
    }
  };

  const nextStep = () => {
    if (isTransitioning) return;
    if (step === 'appointment') {
      const date = form.getValues('date');
      const slot = form.getValues('timeSlot');
      if (!date || !slot) {
        form.trigger(['date', 'timeSlot']);
        return;
      }
      const { isFull } = getSlotStatus(slot);
      if (isFull) {
        toast({
          variant: 'destructive',
          title: 'Slot Full',
          description: 'This slot is full.'
        });
        return;
      }
      setIsTransitioning(true);
      setStep('items');
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (step === 'items') {
      const hasSelection = Object.values(selectedItems).some(item => item.enabled && item.quantity > 0);
      if (!hasSelection) {
        toast({
          variant: 'destructive',
          title: 'Selection Required',
          description: 'Please select at least one item with quantity > 0'
        });
        return;
      }
      setIsTransitioning(true);
      setStep('payment');
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const prevStep = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (step === 'items') setStep('appointment');
    if (step === 'payment') setStep('items');
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (!citizen) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 py-8 max-w-4xl mx-auto">
        <Card className="w-full shadow-2xl overflow-hidden rounded-[3rem] border-none">
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
                            <FormLabel className="text-lg font-bold text-gray-700">
                                {bookingI18n.form.slotLabel}
                                <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-tighter animate-pulse bg-green-50 text-green-700 border-green-200">Live</Badge>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDate}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-2 font-medium hover:border-primary transition-all">
                                  <SelectValue placeholder={bookingI18n.form.slotPlaceholder} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl">
                                {TIME_SLOTS.map((slot) => {
                                  const { count, isFull } = getSlotStatus(slot);
                                  return (
                                    <SelectItem key={slot} value={slot} disabled={isFull}>
                                        <div className="flex flex-col w-full py-1">
                                          <div className="flex items-center justify-between gap-4 mb-1">
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-primary" />
                                              <span className="font-medium">{slot}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                              <span className="text-xs font-bold">{count}/{MAX_SLOT_CAPACITY}</span>
                                            </div>
                                          </div>
                                          <Progress value={(count / MAX_SLOT_CAPACITY) * 100} className="h-1" />
                                        </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {step === 'items' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <h3 className="font-bold text-2xl text-gray-800">{bookingI18n.allocationTitle}</h3>
                        <p className="text-sm text-muted-foreground">Select quantities within your monthly remaining quota.</p>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary px-4 py-1 rounded-full bg-primary/5">Quota Managed</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(normalizedAllocation).map(([key, val]) => {
                        const remaining = remainingQuotas[key] || 0;
                        const unit = (val as string).split(' ')[1] || 'Kg';
                        
                        return (
                          <div key={key} className={cn(
                            "flex items-center justify-between p-5 rounded-[2.5rem] border-2 transition-all",
                            selectedItems[key]?.enabled ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 bg-white opacity-80"
                          )}>
                            <div className="flex items-center gap-5">
                              <Checkbox 
                                id={`check-${key}`}
                                checked={selectedItems[key]?.enabled}
                                disabled={remaining <= 0}
                                onCheckedChange={(checked) => 
                                  setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], enabled: !!checked } }))
                                }
                                className="h-7 w-7 rounded-lg"
                              />
                              <div>
                                <label htmlFor={`check-${key}`} className="text-lg font-bold capitalize cursor-pointer block">
                                  {i18n.data.items[key] || key}
                                </label>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-muted-foreground font-medium">Monthly Max: {val as string}</p>
                                  <span className="text-gray-300">•</span>
                                  <p className={cn("text-sm font-bold", remaining > 0 ? "text-green-600" : "text-destructive")}>
                                    Remaining: {remaining} {unit}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                  <Input 
                                    type="number"
                                    min={0}
                                    max={remaining}
                                    step="0.1"
                                    value={selectedItems[key]?.quantity || 0}
                                    onChange={(e) => {
                                      const v = Math.min(remaining, Math.max(0, parseFloat(e.target.value) || 0));
                                      setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], quantity: v } }));
                                    }}
                                    className="w-24 text-right h-12 rounded-xl font-bold pr-10 border-2"
                                    disabled={!selectedItems[key]?.enabled || remaining <= 0}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{unit}</span>
                                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {Object.values(remainingQuotas).every(q => q <= 0) && (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-2xl">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Quota Exhausted</AlertTitle>
                        <AlertDescription>
                          You have fully utilized your ration quota for this month. New bookings will be available next month.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="p-8 bg-green-600 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-1">{bookingI18n.form.total}</p>
                        <h4 className="text-5xl font-bold">{formatCurrency(totalAmount)}</h4>
                      </div>
                      <CreditCard className="h-24 w-24 text-white/10 absolute -right-4 -bottom-4 transform rotate-12" />
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
                              value={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <div className="relative">
                                <RadioGroupItem value="cash" id="cash" className="sr-only" />
                                <Label
                                  htmlFor="cash"
                                  className={cn(
                                    "flex items-center justify-between p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all",
                                    field.value === 'cash' ? "border-green-600 bg-green-50 ring-2 ring-green-600/20 shadow-md" : "hover:bg-gray-50 border-gray-100"
                                  )}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        field.value === 'cash' ? "border-green-600" : "border-gray-300"
                                    )}>
                                        {field.value === 'cash' && <div className="h-3 w-3 rounded-full bg-green-600" />}
                                    </div>
                                    <div className="font-bold text-lg">{i18n.data.payments.cash}</div>
                                  </div>
                                </Label>
                              </div>

                              <div className="relative">
                                <RadioGroupItem value="upi" id="upi" className="sr-only" />
                                <Label
                                  htmlFor="upi"
                                  className={cn(
                                    "flex items-center justify-between p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all",
                                    field.value === 'upi' ? "border-green-600 bg-green-50 ring-2 ring-green-600/20 shadow-md" : "hover:bg-gray-50 border-gray-100"
                                  )}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        field.value === 'upi' ? "border-green-600" : "border-gray-300"
                                    )}>
                                        {field.value === 'upi' && <div className="h-3 w-3 rounded-full bg-green-600" />}
                                    </div>
                                    <div className="font-bold text-lg">{i18n.data.payments.upi}</div>
                                  </div>
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 'qr' && generatedQRUrl && (
                  <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-in zoom-in-95 duration-700">
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-primary relative z-10">
                      <QRCodeSVG id="collection-qr-code" value={generatedQRUrl} size={220} level="H" includeMargin />
                    </div>
                    <div className="text-center space-y-3">
                      <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-2 rounded-full font-bold border border-green-100">
                        <CheckCircle className="h-5 w-5" />
                        {bookingI18n.success.title}
                      </div>
                      <p className="text-gray-500 font-medium max-w-sm">{bookingI18n.form.qrInstructions}</p>
                    </div>
                    <div className="w-full max-w-sm space-y-4 pt-4">
                      <Button type="button" className="w-full h-14 rounded-2xl text-lg font-bold" onClick={handleDownloadQR}>
                        <Download className="mr-3 h-6 w-6" />
                        {bookingI18n.form.downloadQR}
                      </Button>
                      <Button type="button" variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold" asChild>
                        <Link href="/dashboard/my-qr-codes">View All QR Codes</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {step !== 'qr' && (
                  <div className="flex items-center gap-6 pt-8">
                    {step !== 'appointment' && (
                      <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl text-lg font-bold" onClick={prevStep} disabled={isTransitioning || isProcessingPayment}>
                        <ArrowLeft className="mr-2 h-6 w-6" />
                        {bookingI18n.form.back}
                      </Button>
                    )}
                    
                    {step !== 'payment' ? (
                      <Button 
                        key={`next-${step}`}
                        type="button" 
                        className="flex-1 h-14 rounded-2xl text-lg font-bold bg-primary" 
                        onClick={nextStep}
                        disabled={isTransitioning}
                      >
                        {bookingI18n.form.next}
                        <ArrowRight className="ml-2 h-6 w-6" />
                      </Button>
                    ) : (
                      <Button 
                        key="submit-booking"
                        type="submit" 
                        className="flex-1 h-14 rounded-2xl text-lg font-bold bg-green-600 hover:bg-green-700" 
                        disabled={form.formState.isSubmitting || isTransitioning || isProcessingPayment}
                      >
                        {form.formState.isSubmitting || isProcessingPayment ? <Loader2 className="animate-spin h-6 w-6" /> : bookingI18n.form.submit}
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>        
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
