'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState, QrcodeErrorCallback, QrcodeSuccessCallback } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, CameraOff, ShieldAlert, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

type PermissionStatus = 'prompt' | 'granted' | 'denied';
type ScannerStatus = 'idle' | 'requesting' | 'scanning' | 'error' | 'success';

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const [permission, setPermission] = useState<PermissionStatus>('prompt');
  const [errorState, setErrorState] = useState<{ title: string; message: string } | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(false);

  // Check for secure context on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
        setIsSecureContext(window.isSecureContext);
    }
  }, []);

  const handlePermission = useCallback(async (retry = false) => {
    if (!isSecureContext) {
        setErrorState({
            title: 'Insecure Connection',
            message: 'QR code scanning requires a secure connection (HTTPS). Please ensure you are on a secure site.',
        });
        setPermission('denied');
        return;
    }
    
    setErrorState(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // We got permission, we can stop the tracks to free the camera for the scanner library
      stream.getTracks().forEach(track => track.stop());
      setPermission('granted');
    } catch (error) {
      console.error('Camera permission error:', error);
      setPermission('denied');
      setErrorState({
        title: 'Camera Access Denied',
        message: 'Camera permission is required to scan the QR code. Please enable camera access for this site in your browser settings.',
      });
    }
  }, [isSecureContext]);

  // Effect to handle scanner startup when permission is granted
  useEffect(() => {
    if (permission !== 'granted' || !readerRef.current) {
      return;
    }

    // Initialize scanner
    const scanner = new Html5Qrcode(readerRef.current.id);
    scannerRef.current = scanner;

    const successCallback: QrcodeSuccessCallback = (decodedText) => {
        if (scanner.isScanning) {
            scanner.stop().then(() => {
                onScanSuccess(decodedText);
            }).catch(err => {
                console.error("Error stopping scanner after success:", err);
                onScanSuccess(decodedText); // Proceed even if stop fails
            });
        }
    };

    const errorCallback: QrcodeErrorCallback = (errorMessage) => {
      // Ignore "QR code not found" errors
    };

    const startScanner = async () => {
        try {
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                    successCallback,
                    errorCallback
                );
            } else {
                setPermission('denied'); // Treat "no cameras" as a denial for UI purposes
                setErrorState({ title: 'Camera Not Found', message: 'No camera was found on this device. Please connect a camera and try again.' });
            }
        } catch (err: any) {
            setPermission('denied');
            setErrorState({ title: 'Scanner Error', message: err.message || 'Could not start the camera.' });
            console.error("Failed to start scanner:", err);
        }
    };
    
    startScanner();

    // Cleanup on unmount
    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(error => {
          console.log('Failed to stop QR code scanner on unmount:', error);
        });
      }
    };
  }, [permission, onScanSuccess]);


  return (
    <div className="relative space-y-4 text-center p-4 border rounded-md bg-gray-50">
      <div id="qr-reader-container" ref={readerRef} className="w-full rounded-md overflow-hidden" />
      
      {permission === 'prompt' && (
         <Button onClick={() => handlePermission()}>
            <CameraOff className="mr-2 h-4 w-4" />
            Request Camera Access
        </Button>
      )}

      {permission === 'denied' && errorState && (
        <Alert variant="destructive">
          {isSecureContext ? <CameraOff className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <AlertTitle>{errorState.title}</AlertTitle>
          <AlertDescription>
            {errorState.message}
          </AlertDescription>
           {isSecureContext && (
             <Button variant="secondary" size="sm" className="mt-4" onClick={() => handlePermission(true)}>
                <RefreshCw className="mr-2 h-4 w-4"/>
                Retry Camera Access
            </Button>
           )}
        </Alert>
      )}
    </div>
  );
};

export default QrScanner;
