
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboard } from '../layout';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  ShoppingCart, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  CreditCard,
  QrCode,
  Info
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/layout/header';
import { QRCodeSVG } from 'qrcode.react';

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

  // Normalize the allocation to ensure Rice is split into Raw and Boiled
  const normalizedAllocation = useMemo(() => {
    if (!citizen?.rationAllocation) return {};
    const alloc = { ...citizen.rationAllocation };
    if (alloc.rice) {
      // Split the combined rice into two (typically 10kg each in TN-PDS for full cards)
      const totalRice = parseInt(alloc.rice as string) || 20;
      alloc.rawRice = `${Math.floor(totalRice/2)} Kg`;
      alloc.boiledRice = `${Math.ceil(totalRice/2)} Kg`;
      delete alloc.rice;
    }
    return alloc;
  }, [citizen]);

  // Initialize selected items once normalized allocation is ready
  useMemo(() => {
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
  }, [selectedItems, prices]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!citizen) return;

    try {
      const finalItems = Object.entries(selectedItems)
        .filter(([_, val]) => val.enabled)
        .map(([key, val]) => ({
          name: key,
          quantity: val.quantity,
          unit: 'Kg'
        }));

      const qrContent = JSON.stringify({
        cardId: citizen.id,
        date: format(data.date, 'yyyy-MM-dd'),
        slot: data.timeSlot,
        items: finalItems,
        total: totalAmount,
        payment: data.paymentMethod
      });

      const bookingsRef = collection(firestore, 'citizens', citizen.id, 'bookings');
      await addDoc(bookingsRef, {
        date: format(data.date, 'yyyy-MM-dd'),
        timeSlot: data.timeSlot,
        status: 'Booked',
        items: finalItems,
        paymentMethod: data.paymentMethod,
        totalAmount,
        qrData: qrContent,
        createdAt: serverTimestamp()
      });

      setGeneratedQR(qrContent);
      setStep('qr');
      
      toast({
        title: bookingI18n.success.title,
        description: bookingI18n.success.description,
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: bookingI18n.error,
      });
    }
  };

  const nextStep = () => {
    if (step === 'appointment') {
      if (!form.getValues('date') || !form.getValues('timeSlot')) {
        form.trigger(['date', 'timeSlot']);
        return;
      }
      setStep('items');
    } else if (step === 'items') {
      setStep('payment');
    }
  };

  const prevStep = () => {
    if (step === 'items') setStep('appointment');
    if (step === 'payment') setStep('items');
  };

  if (!citizen) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 py-8">
        <Card className="w-full max-w-2xl shadow-xl overflow-hidden">
          <CardHeader className="bg-primary text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  {bookingI18n.title}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {bookingI18n.description}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild className="text-white hover:bg-white/20">
                <Link href="/"><ArrowLeft /></Link>
              </Button>
            </div>
          </CardHeader>

          {/* Stepper Header */}
          <div className="flex bg-gray-50 border-b px-6 py-4 overflow-x-auto">
            {['appointment', 'items', 'payment', 'qr'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold mr-2",
                  step === s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                )}>
                  {idx + 1}
                </div>
                <span className={cn(
                  "text-xs font-semibold whitespace-nowrap mr-4",
                  step === s ? "text-primary" : "text-gray-400"
                )}>
                  {bookingI18n.steps[s as keyof typeof bookingI18n.steps]}
                </span>
                {idx < 3 && <div className="h-px w-8 bg-gray-300 mr-4" />}
              </div>
            ))}
          </div>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {step === 'appointment' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="font-bold">{bookingI18n.form.dateLabel}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      'w-full justify-start pl-3 text-left font-normal h-12',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, 'PPP') : <span>{bookingI18n.form.datePlaceholder}</span>}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
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
                            <FormLabel className="font-bold">{bookingI18n.form.slotLabel}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder={bookingI18n.form.slotPlaceholder} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</SelectItem>
                                <SelectItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</SelectItem>
                                <SelectItem value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</SelectItem>
                                <SelectItem value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</SelectItem>
                                <SelectItem value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</SelectItem>
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
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="font-bold text-lg border-b pb-2">{bookingI18n.allocationTitle}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(normalizedAllocation).map(([key, val]) => {
                        const maxQty = parseInt((val as string).split(' ')[0]) || 0;
                        return (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border group hover:border-primary transition-colors">
                            <div className="flex items-center gap-4">
                              <Checkbox 
                                id={`check-${key}`}
                                checked={selectedItems[key]?.enabled}
                                onCheckedChange={(checked) => 
                                  setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], enabled: !!checked } }))
                                }
                                className="h-6 w-6"
                              />
                              <div>
                                <label htmlFor={`check-${key}`} className="font-bold capitalize cursor-pointer">
                                  {i18n.data.items[key] || key}
                                </label>
                                <p className="text-xs text-muted-foreground">Max: {val as string}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input 
                                  type="number"
                                  min={0}
                                  max={maxQty}
                                  value={selectedItems[key]?.quantity || 0}
                                  onChange={(e) => {
                                    const v = Math.min(maxQty, Math.max(0, parseInt(e.target.value) || 0));
                                    setSelectedItems(prev => ({ ...prev, [key]: { ...prev[key], quantity: v } }));
                                  }}
                                  className="w-20 text-right h-10 font-bold"
                                  disabled={!selectedItems[key]?.enabled}
                                />
                                <span className="text-sm font-medium text-gray-500">Kg</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">{bookingI18n.form.total}</p>
                        <h4 className="text-3xl font-bold text-primary">₹ {totalAmount}</h4>
                      </div>
                      <CreditCard className="h-10 w-10 text-primary opacity-20" />
                    </div>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-lg font-bold">{bookingI18n.form.paymentLabel}</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid grid-cols-1 gap-4"
                            >
                              <div className={cn(
                                "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                                field.value === 'cash' ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-gray-50"
                              )} onClick={() => field.onChange('cash')}>
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value="cash" id="cash" />
                                  <div className="font-bold">{i18n.data.payments.cash}</div>
                                </div>
                                <Info className="h-5 w-5 text-gray-400" />
                              </div>

                              <div className={cn(
                                "flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all",
                                field.value === 'upi' ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-gray-50"
                              )} onClick={() => field.onChange('upi')}>
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value="upi" id="upi" />
                                  <div className="font-bold">{i18n.data.payments.upi}</div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-8 h-5 bg-gray-200 rounded text-[8px] flex items-center justify-center">GPay</div>
                                    <div className="w-8 h-5 bg-gray-200 rounded text-[8px] flex items-center justify-center">UPI</div>
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
                  <div className="flex flex-col items-center justify-center space-y-6 py-6 animate-in zoom-in duration-500">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-primary">
                      <QRCodeSVG value={generatedQR} size={200} level="H" includeMargin />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-primary">{bookingI18n.success.title}</h3>
                      <p className="text-sm text-gray-500 max-w-xs">{bookingI18n.form.qrInstructions}</p>
                    </div>
                    <div className="w-full space-y-3">
                      <Button type="button" className="w-full bg-green-600 hover:bg-green-700 h-12" onClick={() => window.print()}>
                        <QrCode className="mr-2 h-5 w-5" />
                        {bookingI18n.form.downloadQR}
                      </Button>
                      <Button type="button" variant="outline" className="w-full h-12" asChild>
                        <Link href="/">{bookingI18n.form.back} to Home</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                {step !== 'qr' && (
                  <div className="flex items-center gap-4 pt-4">
                    {step !== 'appointment' && (
                      <Button type="button" variant="outline" className="flex-1 h-12" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        {bookingI18n.form.back}
                      </Button>
                    )}
                    
                    {step !== 'payment' ? (
                      <Button type="button" className="flex-1 h-12 bg-primary hover:bg-primary/90" onClick={nextStep}>
                        {bookingI18n.form.next}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Button type="submit" className="flex-1 h-12 bg-green-600 hover:bg-green-700" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                          <>{bookingI18n.form.submitting}</>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            {bookingI18n.form.submit}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
          {step === 'payment' && (
             <CardFooter className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                <p>Note: Items selected here are final and will be locked for this collection date.</p>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
