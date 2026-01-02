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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { QrCode, Fingerprint, KeyRound, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, title: 'User Details', icon: UserCheck },
  { id: 2, title: 'Aadhaar Verification', icon: Fingerprint },
  { id: 3, title: 'OTP Verification', icon: KeyRound },
  { id: 4, title: 'Confirmation', icon: QrCode },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const progress = (step / steps.length) * 100;
  
  const handleNext = () => {
    if (step === 1 && (!username || !smartCardNumber)) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please fill in all details."});
        return;
    }
    if (step === 2 && aadhaarNumber.length !== 12) {
        toast({ variant: "destructive", title: "Invalid Aadhaar", description: "Aadhaar number must be 12 digits."});
        return;
    }
    if (step === 3 && otp.length !== 6) {
        toast({ variant: "destructive", title: "Invalid OTP", description: "Please enter the 6-digit OTP."});
        return;
    }
    if (step < steps.length) {
      setStep(step + 1);
      if(step === 2) {
         toast({ title: "OTP Sent", description: "OTP sent to your Aadhaar-registered mobile."});
      }
    }
  };

  const handleFinish = () => {
    if (!isConfirmed) {
        toast({ variant: "destructive", title: "Confirmation Required", description: "Please confirm your details."});
        return;
    }
    // TODO: Implement actual Firebase user creation
    toast({ title: "Account Created", description: "You will be redirected to the main page." });
    router.push('/');
  };

  const CurrentStepIcon = steps[step-1].icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center text-center">
          <GovernmentEmblem className="mb-4 h-16 w-16" />
          <CardTitle className="text-2xl font-bold text-primary">
            Create New Account
          </CardTitle>
          <CardDescription>
            Follow the steps to register for a new Smart Card account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <Progress value={progress} />
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
                <CurrentStepIcon className="h-5 w-5" />
                <span>Step {step} of {steps.length}: {steps[step-1].title}</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smart-card">Smart Card Number</Label>
                <div className="flex gap-2">
                    <Input id="smart-card" placeholder="Enter Smart Card Number Manually" value={smartCardNumber} onChange={e => setSmartCardNumber(e.target.value)} />
                    <Button variant="outline" size="icon"><QrCode className="h-5 w-5" /></Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input id="aadhaar" placeholder="Enter 12-digit Aadhaar Number" maxLength={12} value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} />
                    <p className="text-xs text-gray-500">OTP will be sent to Aadhaar-registered mobile number.</p>
                </div>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" placeholder="Enter 6-digit OTP" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
                </div>
                <div className="text-center text-sm">
                    Didn't receive OTP? <Button variant="link" className="p-0 h-auto">Resend OTP</Button> (in 30s)
                </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 rounded-md border bg-gray-50 p-4">
                <h4 className="font-semibold">Confirm Your Details</h4>
                <div className="space-y-2 text-sm">
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Aadhaar Number:</strong> **** **** {aadhaarNumber.slice(-4)}</p>
                    <p><strong>Smart Card Number:</strong> {smartCardNumber}</p>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="confirm-details" checked={isConfirmed} onCheckedChange={checked => setIsConfirmed(Boolean(checked))} />
                    <Label htmlFor="confirm-details" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I confirm the above details are correct.
                    </Label>
                </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between">
            {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 4 && <Button onClick={handleNext}>Next</Button>}
            {step === 2 && <Button onClick={handleNext}>Send OTP</Button>}
            {step === 3 && <Button onClick={handleNext}>Verify OTP</Button>}
            {step === 4 && <Button onClick={handleFinish} disabled={!isConfirmed}>Finish Sign Up</Button>}
        </CardFooter>
      </Card>
      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
