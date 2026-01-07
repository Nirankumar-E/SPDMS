'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
      return;
    }
    
    scannerRef.current = new Html5Qrcode('qr-reader-container');
    const html5QrCode = scannerRef.current;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setHasPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Not Found',
            description: 'No camera was found on this device. Please connect a camera and try again.',
          });
          return;
        }

        // If we found cameras, we have permission (or it will be requested)
        setHasPermission(true);

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // successful scan
            if (html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(err => {
                console.error("Error stopping scanner after success:", err);
                onScanSuccess(decodedText); // Proceed even if stop fails
              });
            }
          },
          (errorMessage) => {
            // parse error, ignore.
          }
        );
      } catch (err: any) {
        setHasPermission(false);
        console.error('QR Scanner Error:', err);
        // This error often means the user has previously denied permission.
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
             toast({
               variant: 'destructive',
               title: 'Camera Permission Denied',
               description: 'Please allow camera access in your browser settings to scan the QR code.',
               duration: 5000,
             });
        } else {
             toast({
               variant: 'destructive',
               title: 'Scanner Error',
               description: err.message || 'Could not start the camera.',
               duration: 5000,
             });
        }
      }
    };

    startScanner();

    return () => {
      // Cleanup function to stop the scanner
      if (html5QrCode && html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
        html5QrCode.stop().catch(error => {
          // This can sometimes throw an error if the scanner is already stopped, so we'll log it but not worry too much.
          console.log('Failed to stop QR code scanner cleanly:', error);
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative space-y-4">
      <div id="qr-reader-container" className="w-full rounded-md overflow-hidden border"></div>
       {hasPermission === false && (
         <Alert variant="destructive">
            <CameraOff className="h-4 w-4" />
           <AlertTitle>Camera Access Required</AlertTitle>
           <AlertDescription>
             Camera permission is required to scan the QR code. Please go to your browser settings, find this site, and grant camera access. You may need to refresh the page after granting permission.
           </AlertDescription>
         </Alert>
       )}
      <Button variant="outline" onClick={onClose} className="w-full">
        <X className="mr-2 h-4 w-4" />
        Cancel Scan
      </Button>
    </div>
  );
};

export default QrScanner;
