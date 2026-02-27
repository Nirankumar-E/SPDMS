
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboard } from '../layout'; 
// import { useDashboard } from '@/lib/dashboard-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { 
  collection, 
  doc, 
  query,
  where
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
  Activity
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/layout/header';
import { QRCodeSVG } from 'qrcode.react';

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
  const { toast } = useToast();
  const { i18n } = useLanguage();
  const bookingI18n = i18n.booking;

  const [step, setStep] = useState<Step>('appointment');
  const [selectedItems, setSelectedItems] = useState<Record<string, { enabled: boolean; quantity: number }>>({});
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [perfMetrics, setPerfMetrics] = useState<{ startTime: number; endTime: number } | null>(null);

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
      where('__name__', '>=', `${citizen.fpsCode}_${dateStr}_`),
      where('__name__', '<=', `${citizen.fpsCode}_${dateStr}_\uf8ff`)
    );
  }, [firestore, citizen?.fpsCode, selectedDate]);

  const { data: slotCounts } = useCollection(slotCountsQuery);

  const getSlotStatus = useCallback((slot: string) => {
    if (!slotCounts || !selectedDate || !citizen?.fpsCode) return { count: 0, isFull: false };
    const idx = TIME_SLOTS.indexOf(slot);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slotId = `${citizen.fpsCode}_${dateStr}_${idx}`;
    const slotDoc = slotCounts.find(s => s.id === slotId);
    const count = slotDoc?.count || 0;
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
    const alloc = { ...citizen.rationAllocation };
    if (alloc.rice) {
      const totalRice = parseFloat(alloc.rice as string) || 20;
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
        const qty = parseFloat((val as string).split(' ')[0]) || 0;
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

  const completeBooking = async (data: BookingFormValues, transactionId?: string) => {
    if (!citizen) return;

    const startTime = performance.now();
    setIsProcessingPayment(true);

    try {
      const dateStr = format(data.date, 'yyyy-MM-dd');

      const finalItems = Object.entries(selectedItems)
        .filter(([_, val]) => val.enabled)
        .map(([key, val]) => ({
          name: key,
          quantity: val.quantity,
        }));

      const response = await fetch("/api/book-slot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          citizenId: citizen.id,
          fpsCode: citizen.fpsCode,
          date: dateStr,
          timeSlot: data.timeSlot,
          items: finalItems,
          paymentMethod: data.paymentMethod,
          totalAmount,
          transactionId: transactionId || null
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      const endTime = performance.now();
      setPerfMetrics({ startTime, endTime });

      setGeneratedQRUrl(result.verifyUrl);
      setStep('qr');

      toast({
        title: bookingI18n.success.title,
        description: `Booking processed in ${Math.round(endTime - startTime)}ms`,
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: error.message,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (step !== 'payment') return;
    if (!citizen) return;

    if (data.paymentMethod === 'upi' && totalAmount > 0) {
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        toast({ 
          variant: 'destructive', 
          title: 'Gateway Not Ready', 
          description: 'Payment SDK is loading. Please wait.' 
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
          description: 'This slot is full. Please pick another one.'
        });
        return;
      }
      setIsTransitioning(true);
      setStep('items');
      setTimeout(() => setIsTransitioning(false), 300);
    } else if (step === 'items') {
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
                                  const { count, isFull } = getSlotStatus(slot);
                                  return (
                                    <SelectItem key={slot} value={slot} disabled={isFull}>
                                        <div className="flex items-center justify-between w-full gap-4 py-0.5">
                                          <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            <span className="font-medium">{slot}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 ml-auto">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            <Badge 
                                              variant={isFull ? "destructive" : "secondary"} 
                                              className={cn(
                                                "text-[10px] px-1.5 h-5 font-bold",
                                                isFull && "bg-destructive/10 text-destructive border-destructive/20"
                                              )}
                                            >
                                              {count}/{MAX_SLOT_CAPACITY}
                                            </Badge>
                                          </div>
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
                      <h3 className="font-bold text-2xl text-gray-800">{bookingI18n.allocationTitle}</h3>
                      <Badge variant="outline" className="text-primary border-primary px-4 py-1 rounded-full bg-primary/5">Eligible Limits</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(normalizedAllocation).map(([key, val]) => {
                        const parts = (val as string).split(' ');
                        const maxQty = parseFloat(parts[0]) || 0;
                        const unit = parts[1] || 'Kg';
                        
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
                                    step="0.01"
                                    value={selectedItems[key]?.quantity || 0}
                                    onChange={(e) => {
                                      const v = Math.min(maxQty, Math.max(0, parseFloat(e.target.value) || 0));
                                      setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], quantity: v } }));
                                    }}
                                    className="w-24 text-right h-12 rounded-xl font-bold pr-10 border-2"
                                    disabled={!selectedItems[key]?.enabled}
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">{unit}</span>
                                </div>
                                {prices[key] > 0 && key !== 'wheat' && (
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
                                  <div className="font-bold text-lg">{i18n.data.payments.cash}</div>
                                </div>
                              </div>

                              <div className={cn(
                                "flex items-center justify-between p-6 rounded-3xl border-2 cursor-pointer transition-all",
                                field.value === 'upi' ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" : "hover:bg-gray-50 border-gray-100"
                              )} onClick={() => field.onChange('upi')}>
                                <div className="flex items-center gap-4">
                                  <RadioGroupItem value="upi" id="upi" className="h-6 w-6" />
                                  <div className="font-bold text-lg">{i18n.data.payments.upi}</div>
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
                      {perfMetrics && (
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold pt-2">
                           <Activity className="h-3 w-3" />
                           Processed in {Math.round(perfMetrics.endTime - perfMetrics.startTime)}ms
                        </div>
                      )}
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
