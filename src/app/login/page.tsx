'use client';

import { useState } from 'react';
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

export default function LoginPage() {
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSendOtp = () => {
    if (smartCardNumber.length < 10) {
        toast({
            variant: "destructive",
            title: "Invalid Smart Card Number",
            description: "Please enter a valid Smart Card number.",
        });
        return;
    }
    setOtpSent(true);
    toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your registered mobile number.",
    });
  };

  const handleLogin = () => {
    if (otp.length !== 6) {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "Please enter the 6-digit OTP.",
        });
        return;
    }
    // TODO: Implement actual Firebase OTP verification
    toast({
        title: "Login Successful",
        description: "Redirecting to the main page...",
    });
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
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
