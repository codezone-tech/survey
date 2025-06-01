import React, { useState } from "react";
import QrScanner from "./QrScanner";
import ImageFromBlob from "./ImageFromBlob";
// import FileViewer from "./FileViewer";

const HomePage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileBlob, setFileBlob] = useState(null);

  const handleScanSuccess = async (decodedText, decodedResult) => {
    setScanResult(decodedText);
    setIsScanning(false);
    if (isValidUrl(decodedText)) {
      try {
        const blob = await fetchFileFromUrl(decodedText);
        setFileBlob(blob);
      } catch (error) {
        console.error('Error fetching file from URL:', error);
      }
    }
  };

  const handleScanError = (error) => {
    console.error("Scan error:", error);
    // Handle scan error if necessary
  };

  const handleRescan = () => {
    setScanResult(null); // Reset the scan result
    setIsScanning(true); // Restart the scanner
  };

  const fetchFileFromUrl = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="survey-form-container">
      <div className="qr-scanner-container">
        <h1>QR Code Scanner</h1>
        {!scanResult && (
          <QrScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            isScanning={isScanning}
            onStartScan={() => setIsScanning(true)}
          />
        )}
        {scanResult && (
          <div className="scan-result">
            <h2>Scan Result:</h2>
            <p>{scanResult}</p>
            <br />
            {fileBlob && (
              <div>
                <h3>Fetched File:</h3>
                {/* Display or process the fileBlob as needed */}
                <ImageFromBlob blob={fileBlob} />
                {/* <FileViewer blob={fileBlob} /> */}
              </div>
            )}
            <br />
            <button
              onClick={handleRescan}
              className="fancy-file-label-camera-btn"
            >
              Rescan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
