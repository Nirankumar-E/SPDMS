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
import { QrCode, X } from 'lucide-react';

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
      // The new dashboard layout will handle redirection logic
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const setupRecaptcha = () => {
    if (!auth) return;
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  };

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
    setupRecaptcha();

    try {
      const citizensRef = collection(firestore, 'citizens');
      const q = query(
        citizensRef,
        where('smartCardNumber', '==', smartCardNumber)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Smart Card not registered.',
        });
        setIsLoading(false);
        return;
      }

      const citizenDoc = querySnapshot.docs[0];
      const phoneNumber = citizenDoc.data().registeredMobile;

      if (!phoneNumber) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No mobile number is associated with this card.',
        });
        setIsLoading(false);
        return;
      }
      
      const appVerifier = window.recaptchaVerifier!;
      const fullPhoneNumber = `+${phoneNumber.replace(/[^0-9]/g, '')}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setIsOtpSent(true);
      toast({ title: 'OTP Sent', description: `An OTP has been sent to the mobile number linked with Smart Card ${smartCardNumber}.` });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description:
          error.code === 'auth/invalid-phone-number' 
            ? 'The phone number associated with this card is invalid.'
            : (error.message || 'Could not send OTP. Please try again later.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter the 6-digit OTP.',
      });
      return;
    }
    setIsLoading(true);
    try {
      // The user mentioned OTP verification isn't a priority,
      // but we still need to call confirm() to complete the sign-in flow.
      const result = await window.confirmationResult?.confirm(otp);
      if (result?.user) {
        toast({ title: 'Success', description: 'Logged in successfully!' });
        router.push('/dashboard');
      } else {
        throw new Error('Could not verify OTP.');
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.code === 'auth/invalid-verification-code' ? 'The OTP you entered is incorrect. Please try again.' : (error.message || 'Could not verify OTP.'),
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

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
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
            Citizen Login
          </CardTitle>
          <CardDescription>
            Login using your Ration Smart Card
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                    onClick={() => setScannerOpen(!isScannerOpen)}
                    disabled={isLoading}
                    aria-label={isScannerOpen ? "Close Scanner" : "Scan QR Code"}
                  >
                    {isScannerOpen ? <X className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {isScannerOpen && (
                 <QrScanner
                    onScanSuccess={handleQrScanSuccess}
                    onClose={() => setScannerOpen(false)}
                  />
              )}

              {isOtpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter 6-digit OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="******"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
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
          <div id="recaptcha-container" className="mt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
}
