
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GovernmentEmblem from '@/components/icons/government-emblem';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase/provider';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useUser } from '@/firebase';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();

   useEffect(() => {
    if (user && !userLoading) {
        router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        }
      });
    }
  }, [auth]);
  
  const handleSendOtp = async () => {
    if (!smartCardNumber) {
        toast({ variant: 'destructive', title: 'Smart Card Number Required', description: 'Please enter your smart card number.' });
        return;
    }
    setIsLoading(true);
    try {
        const q = query(collection(firestore, "users"), where("smartCardNumber", "==", smartCardNumber));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ variant: 'destructive', title: 'No Account Found', description: 'No account found with this Smart Card Number. Please create a new account.' });
            setIsLoading(false);
            return;
        }

        const userData = querySnapshot.docs[0].data();
        const userPhoneNumber = userData.phoneNumber;
        setPhoneNumber(userPhoneNumber);
        
        const fullPhoneNumber = `+91${userPhoneNumber}`;
        const appVerifier = window.recaptchaVerifier!;
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;

        setOtpSent(true);
        toast({ title: 'OTP Sent', description: `An OTP has been sent to your registered mobile number ending in ${userPhoneNumber.slice(-4)}.` });
    } catch (error: any) {
        console.error("Error sending OTP: ", error);
        toast({ variant: 'destructive', title: 'Failed to send OTP', description: error.message });
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    if (!otp) {
        toast({ variant: 'destructive', title: 'OTP Required', description: 'Please enter the OTP.'});
        return;
    }
    if (otp.length !== 6) {
        toast({ variant: 'destructive', title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.'});
        return;
    }
    setIsLoading(true);
    try {
        await window.confirmationResult.confirm(otp);
        toast({ title: 'Login Successful', description: 'Redirecting to your dashboard.'});
        router.push('/dashboard');
    } catch (error: any) {
        console.error("Error verifying OTP: ", error);
        toast({ variant: 'destructive', title: 'Login Failed', description: 'The OTP you entered is incorrect.'});
    }
    setIsLoading(false);
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <GovernmentEmblem className="mb-4 h-16 w-16" />
          <CardTitle className="text-2xl font-bold text-primary">
            Citizen Login
          </CardTitle>
          <CardDescription>
            Login using your registered Smart Card & Aadhaar-linked mobile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="smart-card">Smart Card Number</Label>
                <Input 
                    id="smart-card" 
                    placeholder="Enter Ration Smart Card Number" 
                    value={smartCardNumber}
                    onChange={(e) => setSmartCardNumber(e.target.value)}
                    disabled={otpSent || isLoading}
                />
            </div>

            {otpSent && (
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input 
                        id="otp" 
                        placeholder="Enter 6-digit OTP" 
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            )}

            {!otpSent ? (
                <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
            ) : (
                <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </Button>
            )}

            <div className="text-center text-sm text-gray-500">
                <Link href="#" className="underline">Forgot Smart Card Number?</Link>
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <p className="text-sm text-center text-gray-600">
                Don't have an account?
            </p>
          <Link href="/signup" className="w-full">
            <Button variant="outline" className="w-full">
                Create New Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
