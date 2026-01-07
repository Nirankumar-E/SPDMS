'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  const startScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }

    const newScanner = new Html5Qrcode('qr-reader-container');
    scannerRef.current = newScanner;

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No cameras found.');
      }

      await newScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop();
          }
        },
        (errorMessage) => {
          // handle scan failure, usually better to ignore.
        }
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Could not start the camera. Please check permissions.';
      toast({
        variant: 'destructive',
        title: 'QR Scanner Error',
        description: errorMessage,
      });
      console.error('QR Scanner Error:', err);
      onClose();
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <div id="qr-reader-container" className="w-full rounded-md overflow-hidden border"></div>
      <div className="absolute top-2 right-2 flex gap-2">
        <Button variant="destructive" size="icon" onClick={onClose} aria-label="Close scanner">
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default QrScanner;
