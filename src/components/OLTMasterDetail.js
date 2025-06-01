import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";

const OLTMasterDetail = () => {
  const [images, setImages] = useState([]);

  // Handle captured image
  const handleCapture = (image, imageName) => {
    // Check if the image already exists in the state
    const imageExists = images.some((img) => img.imageName === imageName);

    if (!imageExists) {
      setImages([...images, { image, imageName }]);
    } else {
      // Update the existing image
      setImages(
        images.map((img) =>
          img.imageName === imageName ? { ...img, image } : img
        )
      );
    }
  };

  // Handle removal of image
  const handleRemove = (imageName) => {
    setImages(images.filter((img) => img.imageName !== imageName));
  };

  // Convert Data URI to Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: mimeString });
  };

  const [formData, setFormData] = useState({
    districtName: "",
    blockName: "",
    phase: "",
    totalNoOlt: "",
    oltNo: "",
    oltLocation: null,
    cableHealth: null,
    noOfCable: null,
    typeOfCable: "",
    fibreCore: "",
    noOfGpPerCable: "",
    latLong: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleGetLatLong = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latLong: `${position.coords.latitude}, ${position.coords.longitude}`,
          });
          toast.success("Location captured successfully!");
        },
        () => {
          toast.error("Could not fetch your location!");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser!");
    }
  };

  const validate = async () => {
    const errors = [
      { field: "districtName", message: "District Name is required" },
      { field: "blockName", message: "Block Name is required" },
      { field: "phase", message: "Phase selection is required" },
      { field: "oltNo", message: "OLT Number is required" },
      { field: "oltLocation", message: "OLT Location is required" },
      { field: "cableHealth", message: "Cable Health reading is required" },
      { field: "noOfCable", message: "No of Cable is required" },
      { field: "typeOfCable", message: "Cable Type is required" },
      { field: "fibreCore", message: "Fibre Core selection is required" },
      { field: "noOfGpPerCable", message: "GP count per cable is required" },
    ];

    for (const error of errors) {
      if (!formData[error.field]) {
        toast.error(error.message);
        return false; // Stop validation after the first error
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (images.length === 0) {
      return;
    }

    // const formData = new FormData();
    images.forEach((img) => {
      formData.append(img.name, dataURItoBlob(img.image), `${img.name}.jpg`);
      formData.append(`${img.name}_latitude`, img.latitude);
      formData.append(`${img.name}_longitude`, img.longitude);
    });

    if (isValid) {
      toast.success("Form submitted successfully!");
      console.log("Form submitted:", formData);
    }
  };

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Submit OLT Master Details</h2>
      <div className="survey-form-wrapper">
        <form className="survey-form" onSubmit={handleSubmit}>
          {/* District Name */}
          <select
            className="form-select"
            name="districtName"
            onChange={handleChange}
          >
            <option value="">Select District</option>
          </select>

          {/* Block Name */}
          <select
            className="form-select"
            name="blockName"
            onChange={handleChange}
          >
            <option value="">Select Block</option>
          </select>

          {/* Phase */}
          <select className="form-select" name="phase" onChange={handleChange}>
            <option value="">Select Phase</option>
            <option value="I">Phase I</option>
            <option value="II">Phase II</option>
          </select>

          {/* Total No. OLT (Fixed Field) */}
          <select
            className="form-select"
            name="totalNoOlt"
            onChange={handleChange}
            disabled
          >
            <option value="3">3</option>
          </select>
          <small id="totalOLTNo">Total No. OLT (As per Block)</small>

          {/* OLT No */}
          <select className="form-select" name="oltNo" onChange={handleChange}>
            <option value="">Select OLT No</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>


           {/* No of cables as per block master data */}
           <input
            type="text"
            className="form-input"
            name="noOfCable"
            placeholder="Enter no of cable"
            onChange={handleChange}
          />

          {/* Type of Cable */}
          <select
            className="form-select"
            name="typeOfCable"
            onChange={handleChange}
          >
            <option value="">Select Type of Cable</option>
            <option value="Loose Tube">Loose Tube</option>
            <option value="Ribbon Fibre">Ribbon Fibre</option>
          </select>

          {/* Fibre Core */}
          <select
            className="form-select"
            name="fibreCore"
            onChange={handleChange}
          >
            <option value="">Select Fibre Core</option>
            <option value="96F">96F</option>
            <option value="48F">48F</option>
            <option value="24F">24F</option>
            <option value="12F">12F</option>
          </select>

          {/* No. of GP Per Cable */}
          <select
            className="form-select"
            name="noOfGpPerCable"
            onChange={handleChange}
          >
            <option value="">Select No. of GP Per Cable</option>
            {[...Array(16)].map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          {/* Capture Lat/Long Button */}
          <button
            type="button"
            className="form-button"
            onClick={handleGetLatLong}
          >
            Capture OLT Location Lat/Long
          </button>
          {formData.latLong && <p>Captured OLT Location Lat/Long: {formData.latLong}</p>}

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Cable Health(OTDR Reading)"
            openCameraLabel={"Upload Cable Health Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Cable Health Image"}
          />
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Zero MH OLT"
            openCameraLabel={"Upload Zero MH OLT"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Zero MH OLT"}
          />

          {/* Submit Button */}
          <button type="submit" className="form-button">
            Save
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default OLTMasterDetail;
