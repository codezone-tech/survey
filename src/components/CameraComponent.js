import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const CameraComponent = ({
  onCapture,
  onRemove,
  imageName,
  openCameraLabel = "Open Camera",
  captureImageLabel = "Capture Image",
  useImageLabel = "Use Image",
  removeImageLabel = "Remove Image",
  reUploadLabel = "Re-upload",
  fieldName = "image",
  latitudeFieldName = "latitude",
  longitudeFieldName = "longitude",
}) => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ latitude: 0.000000, longitude: 0.000000 });
  const [error, setError] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [finalImage, setFinalImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isLocationDenied, setIsLocationDenied] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        handlePermissionStatus(permissionStatus.state);
        permissionStatus.onchange = () => {
          handlePermissionStatus(permissionStatus.state);
        };
      } catch (err) {
        console.error("Error checking location permission:", err);
      }
    }
  };

  const handlePermissionStatus = (state) => {
    if (state === "granted") {
      setIsLocationDenied(false);
      setError(null);
    } else if (state === "denied") {
      setIsLocationDenied(true);
      setError("Location access is denied. Default coordinates (0, 0) will be used.");
    }
  };

  const openCamera = () => {
    setIsCameraOpen(true);
    setFinalImage(null);
    setImage(null);
  };

  const captureImage = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);

    try {
      const position = await getLocation();
      setLocation(position);
      setIsLocationDenied(false);
      setError(null);
    } catch (err) {
      setLocation({ latitude: 0.000000, longitude: 0.000000 });
      setIsLocationDenied(err.code === err.PERMISSION_DENIED);
      setError(
        err.code === err.PERMISSION_DENIED
          ? "Location access denied. Using default coordinates (0, 0)."
          : "Location unavailable. Using default coordinates (0, 0)."
      );
    }
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  const overlayLocationOnImage = (imageSrc, latitude, longitude, imageName) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.src = imageSrc;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Always show coordinates (6 decimal places)
        ctx.font = "17px Arial";
        ctx.fillStyle = "red";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        const locationText = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
        ctx.strokeText(locationText, 10, 30);
        ctx.fillText(locationText, 10, 30);

        // Add image name
        const nameText = `Name: ${imageName}`;
        ctx.strokeText(nameText, 10, 60);
        ctx.fillText(nameText, 10, 60);

        resolve(canvas.toDataURL("image/jpeg"));
      };

      img.onerror = () => resolve(imageSrc);
    });
  };

  const removeImage = () => {
    setImage(null);
    setLocation({ latitude: 0.000000, longitude: 0.000000 });
    setIsCameraOpen(false);
    onRemove(imageName);
    setFinalImage(null);
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([arrayBuffer], { type: mimeString });
  };

  const handleUseImage = async (e) => {
    e.preventDefault();
    if (!image) {
      setError("Image is missing.");
      return;
    }

    try {
      const finalImageWithOverlay = await overlayLocationOnImage(
        image,
        location.latitude,
        location.longitude,
        imageName
      );

      const blob = dataURItoBlob(finalImageWithOverlay);
      const formData = new FormData();
      formData.append(fieldName, blob, `${imageName}.jpg`);
      formData.append(latitudeFieldName, location.latitude);
      formData.append(longitudeFieldName, location.longitude);

      onCapture(formData, imageName, fieldName, latitudeFieldName, longitudeFieldName);
      setFinalImage(finalImageWithOverlay);
      setImage(null);
      setIsCameraOpen(false);
    } catch (err) {
      console.error("Error in handleUseImage:", err);
      setError("Failed to process image. Please try again.");
    }
  };

  const switchCamera = (e) => {
    e.preventDefault();
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  return (
    <div className="camera-container">
      {finalImage && (
        <div className="final-image-container">
          <img
            src={finalImage}
            alt={`Final ${imageName}`}
            style={{ width: "100%", margin: "0px" }}
          />
          <p>{imageName}</p>
        </div>
      )}

      {!isCameraOpen && !image && (
        <button className="fancy-file-label-camera-btn" onClick={openCamera}>
          {!finalImage ? openCameraLabel : reUploadLabel}
        </button>
      )}

      {isCameraOpen && !image && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="camera-view"
            videoConstraints={{ facingMode }}
          />
          <div className="button-container">
            <button
              className="fancy-file-label-camera-btn"
              onClick={captureImage}
            >
              {captureImageLabel}
            </button>
            {/* <button
              className="fancy-file-label-camera-btn"
              onClick={switchCamera}
            >
              Switch Camera
            </button> */}
          </div>
        </>
      )}

      {image && (
        <>
          <img src={image} alt="Captured" className="captured-image" />
          <div className="button-container">
            <button
              className="fancy-file-label-camera-btn"
              onClick={removeImage}
            >
              {removeImageLabel}
            </button>
            <button
              className="fancy-file-label-camera-btn"
              onClick={handleUseImage}
            >
              {useImageLabel}
            </button>
          </div>
        </>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CameraComponent;
