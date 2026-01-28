
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
import { QrCode, X, Database, Loader2 } from 'lucide-react';
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
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, router]);

  const handleSeedData = async () => {
    setIsLoading(true);
    const batch = writeBatch(firestore);
    
    const sampleCitizens = [
      {
        id: "TN-PDS-SAMPLE-123",
        name: "Muthu Kumar",
        cardType: "PHH",
        fpsCode: "FPS-CHE-001",
        district: "Chennai",
        registeredMobile: "9876543210",
        familyMembers: [
          { id: "1", name: "Muthu Kumar", age: 45, gender: "Male", relation: "Head" },
          { id: "2", name: "Saraswathi", age: 40, gender: "Female", relation: "Wife" },
          { id: "3", name: "Karthik", age: 18, gender: "Male", relation: "Son" }
        ],
        rationAllocation: { rawRice: "10 Kg", boiledRice: "10 Kg", wheat: "5 Kg", sugar: "2 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-04-996215",
        name: "Billu",
        cardType: "PHH",
        fpsCode: "FPS022",
        district: "Chennai",
        registeredMobile: "9517533214",
        familyMembers: [
          { id: "M001", name: "Billu", age: 25, gender: "Male", relation: "Head" },
          { id: "M002", name: "Susi", age: 24, gender: "Female", relation: "Wife" }
        ],
        rationAllocation: { rawRice: "5 Kg", boiledRice: "5 Kg", wheat: "1 Kg", sugar: "2 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-05-996216",
        name: "Deepak",
        cardType: "NPHH",
        fpsCode: "FPS013",
        district: "Chengalpattu",
        registeredMobile: "7531598745",
        familyMembers: [
          { id: "M001", name: "Deepak", age: 36, gender: "Male", relation: "Head" },
          { id: "M002", name: "Sandhiya", age: 35, gender: "Female", relation: "Wife" },
          { id: "M003", name: "Surya", age: 10, gender: "Male", relation: "Son" },
          { id: "M004", name: "Ananya", age: 8, gender: "Female", relation: "Daughter" }
        ],
        rationAllocation: { rawRice: "7 Kg", boiledRice: "8 Kg", wheat: "0 Kg", sugar: "1 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-06-996217",
        name: "dheeraj",
        cardType: "PHH",
        fpsCode: "FPS014",
        district: "Chengalpattu",
        registeredMobile: "7531598745",
        familyMembers: [
          { id: "M001", name: "dheeraj", age: 40, gender: "Male", relation: "Head" },
          { id: "M002", name: "dhivyasri", age: 39, gender: "Female", relation: "Wife" },
          { id: "M003", name: "Aadheek", age: 10, gender: "Male", relation: "Son" }
        ],
        rationAllocation: { rawRice: "7 Kg", boiledRice: "8 Kg", wheat: "1 Kg", sugar: "2 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-07-996218",
        name: "Dwaraka Seenuvass",
        cardType: "NPHH",
        fpsCode: "FPS076",
        district: "Chengalpattu",
        registeredMobile: "9632587417",
        familyMembers: [
          { id: "M001", name: "Dwaraka Seenuvass", age: 36, gender: "Male", relation: "Head" },
          { id: "M002", name: "Harini", age: 35, gender: "Female", relation: "Wife" },
          { id: "M003", name: "Dwharika", age: 10, gender: "Female", relation: "Daughter" },
          { id: "M004", name: "Dhruv", age: 8, gender: "Male", relation: "Son" }
        ],
        rationAllocation: { rawRice: "7 Kg", boiledRice: "8 Kg", wheat: "0 Kg", sugar: "1 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-08-996220",
        name: "Silambaraselvan",
        cardType: "PHH",
        fpsCode: "FPS067",
        district: "Madurai",
        registeredMobile: "6541239870",
        familyMembers: [
          { id: "M001", name: "Silambaraselvan", age: 29, gender: "Male", relation: "Head" },
          { id: "M002", name: "kiara", age: 29, gender: "Female", relation: "Wife" }
        ],
        rationAllocation: { rawRice: "5 Kg", boiledRice: "5 Kg", wheat: "1 Kg", sugar: "1 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      },
      {
        id: "TN-PDS-09-996220",
        name: "Vikram",
        cardType: "PHH",
        fpsCode: "FPS035",
        district: "Chennai",
        registeredMobile: "9873216548",
        familyMembers: [
          { id: "M001", name: "Vikram", age: 38, gender: "Male", relation: "Head" },
          { id: "M002", name: "Kumutha", age: 39, gender: "Female", relation: "Wife" },
          { id: "M003", name: "Varsha", age: 10, gender: "Female", relation: "Daughter" },
          { id: "M004", name: "Harsha", age: 10, gender: "Female", relation: "Daughter" }
        ],
        rationAllocation: { rawRice: "5 Kg", boiledRice: "5 Kg", wheat: "2 Kg", sugar: "2 Kg", palmOil: "1 L", toorDal: "1 Kg" }
      }
    ];

    try {
      for (const citizen of sampleCitizens) {
        const citizenRef = doc(firestore, 'citizens', citizen.id);
        batch.set(citizenRef, {
          ...citizen,
          profileCompleted: true
        });

        // Add a single prototype booking for each
        const bookingId = `proto-booking-${citizen.id}`;
        const bookingRef = doc(firestore, 'citizens', citizen.id, 'bookings', bookingId);
        batch.set(bookingRef, {
          date: "2024-11-20",
          timeSlot: "10:00 AM - 11:00 AM",
          status: "Booked",
          items: [
            { name: "rawRice", quantity: 5, unit: "Kg" },
            { name: "boiledRice", quantity: 5, unit: "Kg" },
            { name: "sugar", quantity: 1, unit: "Kg" }
          ],
          paymentMethod: "cash",
          totalAmount: 25,
          qrData: JSON.stringify({
            cardId: citizen.id,
            date: "2024-11-20",
            slot: "10:00 AM - 11:00 AM",
            items: [{ name: "rawRice", quantity: 5 }, { name: "boiledRice", quantity: 5 }],
            total: 25,
            payment: "cash"
          }),
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();

      setSmartCardNumber("TN-PDS-04-996215");
      setIsOtpSent(true);
      toast({
        title: "Database Seeded",
        description: "Added 7 sample profiles. Try card TN-PDS-04-996215. Use any 6 digits for OTP.",
      });
    } catch (error: any) {
      console.error('Seeding error:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const trimmedSmartCardNumber = smartCardNumber.trim();
    if (!trimmedSmartCardNumber) return;
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
    if (!otp || otp.length !== 6) return;
    setIsLoading(true);
    try {
      const trimmedSmartCardNumber = smartCardNumber.trim();
      localStorage.setItem('loggedInSmartCardNumber', trimmedSmartCardNumber);
      await signInAnonymously(auth);
      router.push('/dashboard');
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
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center justify-center p-4 mt-8">
        <Card className="w-full max-w-md shadow-lg border-t-4 border-primary">
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
                      className="h-12"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
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
                      className="h-12 text-center text-2xl tracking-widest font-bold"
                      required
                    />
                  </div>
                )}
                
                <div className="pt-2 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? loginI18n.processing
                      : isOtpSent
                      ? loginI18n.loginButton
                      : loginI18n.verifyButton}
                  </Button>

                  {!isOtpSent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 border-dashed text-muted-foreground hover:text-primary"
                      onClick={handleSeedData}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
                      Seed Prototype Data
                    </Button>
                  )}
                </div>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
