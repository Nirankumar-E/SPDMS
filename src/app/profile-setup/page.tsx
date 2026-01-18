'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, query, where } from 'firebase/firestore';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import GovernmentEmblem from '@/components/icons/government-emblem';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  // Add other fields you want the user to confirm/update
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfileSetupPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [smartCardNumber, setSmartCardNumber] = useState<string | null>(null);

  // On the client, retrieve the smart card number from localStorage.
  useEffect(() => {
    const storedCardNumber = localStorage.getItem('loggedInSmartCardNumber');
    if (storedCardNumber) {
      setSmartCardNumber(storedCardNumber);
    } else if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  const citizenQuery = useMemoFirebase(() => {
    if (!firestore || !smartCardNumber) return null;
    return query(collection(firestore, 'citizens'), where('smartCardNumber', '==', smartCardNumber));
  }, [firestore, smartCardNumber]);

  const { data: citizenData, isLoading: isCitizenLoading } = useCollection(citizenQuery);
  const citizen = (citizenData && citizenData.length > 0) ? citizenData[0] : null;


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: { // Pre-fill form with fetched data
        name: ''
    }
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
    if (citizen) {
        if(citizen.profileCompleted) {
            router.replace('/dashboard');
        }
        const headOfFamily = citizen.familyMembers?.find((m: any) => m.relation === 'Head');
        form.reset({
            name: headOfFamily?.name || citizen.name || ''
        });
    }
  }, [user, isUserLoading, citizen, router, form]);


  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!citizen) return;

    try {
      // We need the actual document ID to update it. `citizen.id` holds this.
      const citizenRef = doc(firestore, 'citizens', citizen.id);
      await updateDoc(citizenRef, {
        name: data.name,
        profileCompleted: true,
      });

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been successfully set up.',
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your profile. Please try again.',
      });
    }
  };
  
  const isLoading = isUserLoading || isCitizenLoading;

  if (isLoading || !citizen) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading Profile Setup...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GovernmentEmblem className="h-20 w-20" />
          </div>
          <CardTitle className="text-2xl text-primary font-headline">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Please confirm your details to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Head of Family Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter your name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <p className='text-sm text-muted-foreground'>Smart Card No: {citizen.smartCardNumber}</p>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save and Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
