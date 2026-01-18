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
import { QrCode, X, Database } from 'lucide-react';


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
    const trimmedSmartCardNumber = smartCardNumber.trim();
    if (!trimmedSmartCardNumber) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter your Smart Card Number.',
      });
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
          description: 'Smart Card not registered. You can use the "Seed Sample Data" button to add test users.',
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
      const trimmedSmartCardNumber = smartCardNumber.trim();
      // Store the smart card number in localStorage so the dashboard can retrieve it.
      localStorage.setItem('loggedInSmartCardNumber', trimmedSmartCardNumber);

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

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
        const citizen1 = {
            cardType: "PHH",
            fpsCode: "FPS045",
            district: "Madurai",
            registeredMobile: "9987654321",
            profileCompleted: false,
            familyMembers: [
                { id: "M001", name: "Ramesh Kumar", age: 42, gender: "Male", relation: "Head" },
                { id: "M002", name: "Lakshmi", age: 38, gender: "Female", relation: "Wife" },
                { id: "M003", name: "Anitha", age: 15, gender: "Female", relation: "Daughter" }
            ],
            rationAllocation: {
                rice: "15 Kg",
                wheat: "3 Kg",
                sugar: "2 Kg",
                palmOil: "1 L",
                toorDal: "1 Kg"
            }
        };

        const citizen2 = {
            cardType: "PHH",
            fpsCode: "FPS112",
            district: "Salem",
            registeredMobile: "9988776654",
            profileCompleted: true,
            familyMembers: [
                { id: "M001", name: "Murugan", age: 30, gender: "Male", relation: "Head" },
                { id: "M002", name: "Meena", age: 28, gender: "Female", relation: "Wife" },
            ],
            rationAllocation: {
                rice: "10 Kg",
                wheat: "1 Kg",
                sugar: "2 Kg",
                palmOil: "1 L",
                toorDal: "1 Kg"
            }
        };

        const citizen3 = {
            cardType: "PHH",
            fpsCode: "FPS078",
            district: "Coimbatore",
            registeredMobile: "9988776654",
            profileCompleted: true,
            familyMembers: [
                { id: "M001", name: "Kumar", age: 38, gender: "Male", relation: "Head" },
                { id: "M002", name: "Vidhya", age: 36, gender: "Female", relation: "Wife" },
                { id: "M003", name: "Rahul", age: 12, gender: "Male", relation: "Son" },
                { id: "M004", name: "Priya", age: 10, gender: "Female", relation: "Daughter" },
            ],
            rationAllocation: {
                rice: "25 Kg",
                wheat: "1 Kg",
                sugar: "2 Kg",
                palmOil: "1 L",
                toorDal: "1 Kg"
            }
        };
        
        await setDoc(doc(firestore, "citizens", "TN-PDS-01458921"), citizen1);
        await setDoc(doc(firestore, "citizens", "TN-PDS-02-783456"), citizen2);
        await setDoc(doc(firestore, "citizens", "TN-PDS-03-996214"), citizen3);

        toast({
            title: "Database Seeded!",
            description: "Sample citizen data has been added to Firestore.",
        });

    } catch (error: any) {
        console.error("Error seeding database:", error);
        toast({
            variant: "destructive",
            title: "Database Seeding Failed",
            description: error.message || "Could not add sample data. Check Firestore rules and configuration.",
        });
    } finally {
        setIsLoading(false);
    }
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
