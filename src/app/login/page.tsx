
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
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userPhoneNumber, setUserPhoneNumber] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (!auth) return;
    if (window.recaptchaVerifier) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }, [auth]);

  const handleSendOtp = async () => {
    if (smartCardNumber.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Smart Card Number',
        description: 'Please enter a valid Smart Card number.',
      });
      return;
    }

    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('smartCardNumber', '==', smartCardNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Account Not Found',
          description: 'No account found with this Smart Card number. Please create a new account.',
        });
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const phoneNumber = userData.phoneNumber;
      setUserPhoneNumber(phoneNumber);

      if (!window.recaptchaVerifier) {
        throw new Error('Recaptcha verifier not initialized');
      }
      
      const appVerifier = window.recaptchaVerifier;
      const fullPhoneNumber = `+91${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;

      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to your registered mobile number ending in ...${phoneNumber.slice(-4)}.`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message || 'An error occurred while sending the OTP. Please try again.',
      });
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit OTP.',
      });
      return;
    }

    try {
      await window.confirmationResult.confirm(otp);
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to the main page...',
      });
      router.push('/');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'The OTP you entered is incorrect. Please try again.',
      });
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          <GovernmentEmblem className="mb-4 h-20 w-20" />
          <CardTitle className="text-2xl font-bold text-primary">
            Citizen Login
          </CardTitle>
          <CardDescription>
            Login using your registered Smart Card & Aadhaar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smart-card">Ration Smart Card Number</Label>
            <Input
              id="smart-card"
              placeholder="Enter Ration Smart Card Number"
              value={smartCardNumber}
              onChange={(e) => setSmartCardNumber(e.target.value)}
              disabled={otpSent}
            />
          </div>
          {otpSent ? (
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                placeholder="6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          ) : (
            <Button onClick={handleSendOtp} className="w-full">
              Send OTP
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {otpSent && (
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/signup">Create New Account</Link>
          </Button>
          <div className="flex w-full justify-between text-sm">
            <Link href="#" className="text-blue-600 hover:underline">
              Forgot Smart Card Number?
            </Link>
            <Link href="#" className="text-blue-600 hover:underline">
              Help / Helpline
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
