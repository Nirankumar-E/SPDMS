'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import GovernmentEmblem from '@/components/icons/government-emblem';
import QrScanner from '@/components/auth/QrScanner';
import { QrCode } from 'lucide-react';

// Extend the Window interface to include properties for Firebase Auth
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  }, [auth]);

  const handleSendOtp = async () => {
    if (!smartCardNumber) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your Smart Card Number.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const beneficiariesRef = collection(firestore, 'beneficiaries');
      const q = query(
        beneficiariesRef,
        where('smartCardNumber', '==', smartCardNumber)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid Smart Card Number.',
        });
        setIsLoading(false);
        return;
      }

      const beneficiaryDoc = querySnapshot.docs[0];
      const phoneNumber = beneficiaryDoc.data().phoneNumber;

      if (!phoneNumber) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No phone number is associated with this card.',
        });
        setIsLoading(false);
        return;
      }

      const appVerifier = window.recaptchaVerifier!;
      const fullPhoneNumber = `+${phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
      toast({ title: 'OTP Sent', description: 'OTP sent to your mobile.' });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.message || 'Could not send OTP. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter the OTP.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await window.confirmationResult?.confirm(otp);
      if (result?.user) {
        toast({ title: 'Success', description: 'Logged in successfully!' });
        router.push('/dashboard');
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not verify OTP.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQrScanSuccess = (decodedText: string) => {
    setSmartCardNumber(decodedText);
    setScannerOpen(false);
    toast({
      title: 'Success',
      description: 'Smart Card number scanned successfully.',
    });
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    return null; // Redirecting...
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GovernmentEmblem className="h-20 w-20" />
          </div>
          <CardTitle className="text-2xl text-primary font-headline">
            Citizen Login
          </CardTitle>
          <CardDescription>
            Login using your Ration Smart Card
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isScannerOpen ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                isOtpSent ? handleVerifyOtp() : handleSendOtp();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="smartCardNumber">Smart Card Number</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="smartCardNumber"
                    type="text"
                    placeholder="Enter Smart Card Number"
                    value={smartCardNumber}
                    onChange={(e) => setSmartCardNumber(e.target.value)}
                    disabled={isOtpSent || isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setScannerOpen(true)}
                    disabled={isOtpSent || isLoading}
                    aria-label="Scan QR Code"
                  >
                    <QrCode className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              {isOtpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="******"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Processing...'
                  : isOtpSent
                  ? 'Verify & Login'
                  : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <div>
              <QrScanner
                onScanSuccess={handleQrScanSuccess}
                onClose={() => setScannerOpen(false)}
              />
            </div>
          )}
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
}
