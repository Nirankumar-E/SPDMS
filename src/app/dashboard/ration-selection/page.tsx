'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDashboard } from '../layout';
import { useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ShoppingCart, CheckCircle, ArrowLeft } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const bookingSchema = z.object({
  date: z.date({
    required_error: 'A date for pickup is required.',
  }),
  timeSlot: z.string({
    required_error: 'Please select a time slot.',
  }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function RationSelectionPage() {
  const { citizen } = useDashboard();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit: SubmitHandler<BookingFormValues> = async (data) => {
    if (!citizen) return;

    try {
      // Use the smart card number (which is the citizen.id) as the document ID for the booking
      const bookingRef = doc(firestore, 'bookings', citizen.id);
      await setDoc(bookingRef, {
        date: format(data.date, 'yyyy-MM-dd'),
        timeSlot: data.timeSlot,
        status: 'Booked',
      });

      toast({
        title: 'Booking Confirmed!',
        description: `Your time slot for ${format(data.date, 'PPP')} at ${data.timeSlot} is confirmed.`,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Could not save your booking. Please try again.',
      });
    }
  };

  if (!citizen) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-primary font-headline flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Ration Selection & Time Slot Booking
            </CardTitle>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                    <ArrowLeft />
                </Link>
            </Button>
          </div>
          <CardDescription>
            Confirm your items and book a collection slot.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ration Items */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Your Monthly Ration Allocation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(citizen.rationAllocation).map(([item, quantity]) => (
                <div key={item} className="p-3 bg-gray-50 rounded-md border text-sm">
                  <p className="font-semibold capitalize">{item}</p>
                  <p>{quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Choose Collection Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Time Slot Picker */}
                <FormField
                  control={form.control}
                  name="timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choose Collection Slot</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
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

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={form.formState.isSubmitting}>
                <CheckCircle className="mr-2 h-5 w-5" />
                {form.formState.isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
