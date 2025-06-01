import React, { useState, useEffect } from 'react';

const ImageFromBlob = ({ blob }) => {
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (blob) {
      console.log('image blob:', blob);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(blob);

      // Clean up the object URL when the component unmounts or the blob changes
      return () => {
        setImageSrc(null);
      };
    }
  }, [blob]);

  return (
    <div>
      {imageSrc ? (
        <img src={imageSrc} alt="Scanned QR Code" />
      ) : (
        <p>No image available</p>
      )}
    </div>
  );
};

export default ImageFromBlob;
