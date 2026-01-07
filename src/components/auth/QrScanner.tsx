'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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
    // Component mounts, create a new scanner instance.
    scannerRef.current = new Html5Qrcode('qr-reader-container');
    const html5QrCode = scannerRef.current;

    const start = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
           setHasPermission(false);
           console.error('No cameras found on this device.');
           toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: 'No camera was found on this device.',
           });
           return;
        }
        setHasPermission(true);

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // successful scan
            onScanSuccess(decodedText);
          },
          (errorMessage) => {
            // parse error, ignore.
          }
        );
      } catch (err: any) {
         setHasPermission(false);
         console.error('QR Scanner Error:', err);
         toast({
           variant: 'destructive',
           title: 'Camera Permission Denied',
           description: 'Please allow camera access in your browser settings to scan the QR code.',
         });
      }
    };

    start();

    return () => {
      // Component unmounts, stop the scanner.
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(error => {
          console.error('Failed to stop QR code scanner.', error);
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
           <AlertTitle>Camera Access Denied</AlertTitle>
           <AlertDescription>
             Could not access the camera. Please ensure you have a camera connected and have granted permission in your browser.
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
