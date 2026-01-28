'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInAnonymously,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
import { useLanguage } from '@/lib/language-context';
import Header from '@/components/layout/header';

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
  const { i18n } = useLanguage();
  const loginI18n = i18n.login;

  useEffect(() => {
    if (!isUserLoading && user) {
      const storedCardNumber = localStorage.getItem('loggedInSmartCardNumber');
      if(storedCardNumber) {
        router.push('/');
      }
    }
  }, [user, isUserLoading, router]);

  
  const handleSendOtp = async () => {
    const trimmedSmartCardNumber = smartCardNumber.trim();
    if (!trimmedSmartCardNumber) {
      return;
    }
    setIsLoading(true);

    try {
      const citizenRef = doc(firestore, 'citizens', trimmedSmartCardNumber);
      const docSnap = await getDoc(citizenRef);


      if (!docSnap.exists()) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: loginI18n.errorNoCard,
        });
        setIsLoading(false);
        return;
      }

      setIsOtpSent(true);
    } catch (error: any) {
      console.error('Error checking Smart Card:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not verify Smart Card.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      return;
    }
    setIsLoading(true);
    try {
      const trimmedSmartCardNumber = smartCardNumber.trim();
      localStorage.setItem('loggedInSmartCardNumber', trimmedSmartCardNumber);
      await signInAnonymously(auth);
      router.push('/');
    } catch (error: any) {
      console.error('Error during login:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
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
      description: loginI18n.scanSuccess,
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 mt-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <GovernmentEmblem className="h-20 w-20" />
            </div>
            <CardTitle className="text-2xl text-primary font-headline">
              {loginI18n.title}
            </CardTitle>
            <CardDescription>
              {loginI18n.subtitle}
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
                  <Label htmlFor="smartCardNumber">{loginI18n.cardLabel}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="smartCardNumber"
                      type="text"
                      placeholder={loginI18n.cardPlaceholder}
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
                    <Label htmlFor="otp">{loginI18n.otpLabel}</Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder={loginI18n.otpPlaceholder}
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
                    ? loginI18n.processing
                    : isOtpSent
                    ? loginI18n.loginButton
                    : loginI18n.verifyButton}
                </Button>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
