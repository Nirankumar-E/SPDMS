'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
      // If a user session exists, try to get the smart card number from local storage
      const storedCardNumber = localStorage.getItem('loggedInSmartCardNumber');
      if(storedCardNumber) {
        router.push('/dashboard');
      }
      // If no card number, they need to log in properly.
      // The session might be from a previous incomplete login.
    }
  }, [user, isUserLoading, router]);

  
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
      const citizenRef = doc(firestore, 'citizens', smartCardNumber);
      const docSnap = await getDoc(citizenRef);


      if (!docSnap.exists()) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Smart Card not registered.',
        });
        setIsLoading(false);
        return;
      }

      // Smart card found, move to OTP screen without sending a real OTP.
      setIsOtpSent(true);
      toast({ title: 'Verification Required', description: `Please enter the OTP to proceed.` });
    } catch (error: any) {
      console.error('Error checking Smart Card:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not verify Smart Card. Please try again later.',
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
        description: 'Please enter a 6-digit code.',
      });
      return;
    }
    setIsLoading(true);
    try {
      // Per instructions, bypass real OTP verification.
      // We will sign the user in anonymously to create a session,
      // and pass the smart card number to the dashboard to fetch data.
      
      // Store the smart card number in localStorage so the dashboard can retrieve it.
      localStorage.setItem('loggedInSmartCardNumber', smartCardNumber);

      // Sign in anonymously to establish a Firebase session
      await signInAnonymously(auth);

      toast({ title: 'Success', description: 'Logged in successfully!' });
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred during login.',
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
                  <Label htmlFor="otp">Enter 6-digit Code</Label>
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
                  : 'Check Smart Card'}
              </Button>
            </form>
          <div id="recaptcha-container" className="mt-4"></div>
        </CardContent>
      </Card>
    </div>
  );
}
