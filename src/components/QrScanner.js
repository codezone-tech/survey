import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ buttonLabel = 'Scan', onScanSuccess, onScanError, fps = 10, qrbox = 250, disableFlip = false }) => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (scanning) {
      const config = { fps, qrbox, disableFlip };
      const verbose = false;

      scannerRef.current = new Html5QrcodeScanner('qr-scanner', config, verbose);
      scannerRef.current.render(onScanSuccess, onScanError);

      return () => {
        scannerRef.current.clear().catch((error) => {
          console.error('Failed to clear scanner. ', error);
        });
      };
    }
  }, [scanning, fps, qrbox, disableFlip, onScanSuccess, onScanError]);

  const startScanning = () => setScanning(true);
  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error('Failed to clear scanner. ', error);
      });
    }
    setScanning(false);
  };

  return (
    <div className="qr-scanner-container">
      {!scanning ? (
        <button onClick={startScanning} className='fancy-file-label-camera-btn'>{buttonLabel}</button>
      ) : (
        <div>
          <div id="qr-scanner" />
          <button onClick={stopScanning} className="fancy-file-label-camera-btn">Stop Scanning</button>
        </div>
      )}
    </div>
  );
};

export default QrScanner;