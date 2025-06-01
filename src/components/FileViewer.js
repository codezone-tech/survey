import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { MapContainer, TileLayer } from 'react-leaflet';
import ReactLeafletKml from 'react-leaflet-kml';
import '@react-18-pdf/renderer/dist/esm/Page/AnnotationLayer.css';
import 'leaflet/dist/leaflet.css';

// Set the workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewer = ({ blob }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [kmlData, setKmlData] = useState(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setFileUrl(url);

      // Clean up the object URL when the component unmounts or the blob changes
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [blob]);

  useEffect(() => {
    if (blob && blob.type === 'application/vnd.google-earth.kml+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const parser = new DOMParser();
        const kml = parser.parseFromString(reader.result, 'text/xml');
        setKmlData(kml);
      };
      reader.readAsText(blob);
    }
  }, [blob]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (!blob) {
    return <p>No file available</p>;
  }

  const mimeType = blob.type;

  if (mimeType.startsWith('image/')) {
    // Render image
    return <img src={fileUrl} alt="Scanned content" />;
  } else if (mimeType === 'application/pdf') {
    // Render PDF
    return (
      <div>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        {numPages && (
          <div>
            <p>
              Page {pageNumber} of {numPages}
            </p>
            <button
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              Previous
            </button>
            <button
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber >= numPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  } else if (mimeType === 'application/vnd.google-earth.kml+xml') {
    // Render KML
    return (
      <MapContainer zoom={15} center={[0, 0]} style={{ height: '500px' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {kmlData && <ReactLeafletKml kml={kmlData} />}
      </MapContainer>
    );
  } else {
    return <p>Unsupported file type: {mimeType}</p>;
  }
};

export default FileViewer;
