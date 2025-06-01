import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";
import api from "../utils/api";
import GPLocations from "../utils/gram_panchayat_master_details.json";
import geoLocations from "../utils/geo_locations.json";
import { addGPData, syncPendingData, getAllGPData, deleteAllGPData } from "../utils/idbHelper";

const GPMasterDetail = () => {

  const [images, setImages] = useState([]);
  const [gramPanchayatList, setGramPanchayatList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
      // Detect online/offline status
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
  
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
  
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);

  useEffect(() => {
    /* const fetchGPDetails = async () => {
      try {
        const gp_details_list = GPLocations.data
          .filter((item) => item.block_id === "882")
          .sort((a, b) => a.gp_name.localeCompare(b.gp_name));

        setGramPanchayatList([gp_details_list]);
      } catch (err) {
        console.log("gp_details_list errors: ", err);
      }
    };*/

    const fetchGEOLocationDetails = async () => {
      try {
        const state_details_list = geoLocations.data
          .filter((item) => item.parent_id === null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setStateList(state_details_list);
      } catch (err) {
        console.log("gp_details_list errors: ", err);
      }
    };

    // fetchGPDetails();
    fetchGEOLocationDetails();
  }, []);

  /** Sync data to the server based on isOnline */
  useEffect(() => {
    console.log('online status', isOnline);
    if (isOnline) {
      const fetchAllSavedGPData = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const savedGPData = await getAllGPData();
        console.log('getSavedAllGPData', savedGPData);
        syncPendingData();
      };
  
      fetchAllSavedGPData();
    }
  }, []);
  

  // Handle captured image
  const handleCapture = (
    formData,
    imageName,
    fieldName,
    latitudeFieldName,
    longitudeFieldName
  ) => {
    console.log("Handling captured image...");

    // Debugging: Log FormData entries
    console.log("Field Name:", fieldName);
    console.log("Latitude Field Name:", latitudeFieldName);
    console.log("Longitude Field Name:", longitudeFieldName);
    console.log("FormData Entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Extract the image blob from the FormData using the correct field name
    const imageBlob = formData.get(fieldName || "image"); // Use the field name for the image blob
    console.log("Image Blob:", imageBlob);

    if (!imageBlob) {
      console.error("Image Blob is undefined or null.");
      return;
    }

    // Extract latitude and longitude from FormData
    const latitude = formData.get(latitudeFieldName);
    const longitude = formData.get(longitudeFieldName);

    // Convert the blob to a data URL for display
    const reader = new FileReader();
    reader.onloadend = () => {
      // const imageDataURL = reader.result;
      // console.log("Image Data URL:", imageDataURL);

      // Create an object to store the image, fieldName, latitude, and longitude
      const newImage = {
        [fieldName]: imageBlob, // Store the blob under the specified fieldName
        [latitudeFieldName]: latitude, // Store latitude under the specified latitudeFieldName
        [longitudeFieldName]: longitude, // Store longitude under the specified longitudeFieldName
        imageName, // Store the image name
      };

      // Check if the image already exists
      const imageExists = images.some((img) => img.imageName === imageName);

      if (!imageExists) {
        // Add the new image to the images array
        setImages([...images, newImage]);
      } else {
        // Update the existing image
        setImages(
          images.map((img) => (img.imageName === imageName ? newImage : img))
        );
      }
    };

    reader.onerror = (err) => {
      console.error("Error reading image blob:", err);
    };

    // Read the blob as a data URL
    reader.readAsDataURL(imageBlob);
  };

  // Handle removal of image
  const handleRemove = (imageName) => {
    setImages(images.filter((img) => img.imageName !== imageName));
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0]; // Formats as YYYY-MM-DD
  };

  const [formData, setFormData] = useState({
    state_id: "",
    district_id: "",
    block_id: "",
    gram_panchayat_id: "",
    gp_building: "",
    gp_working_status: "",
    surpanch_name: "",
    address: "",
    mobile_no: "",
    ont: "",
    ont_make_serial_no: "",
    electrical_power: "",
    solar_panel: "",
    solar_serial_no: "",
    solar_wire: "",
    battery: "",
    battery_make_serial_no: "",
    ccu: "",
    ccu_make_serial_no: "",
    earthing_status: "",
    earthing: "",
    earthing_cable: "",
    fibre_termination_box: "",
    enclosure: "",
    splitter: "",
    vle_captured_access: "",
    optical_power: "",
    otdr: "",
    optical_power_not_available_details: "",
    ont_ports_used: "",
    splitter_ports_used: "",
    hoto_survey_date: getCurrentDate(),
    fiber: "",
  });

  const handleChange = (e) => {
    if (e.target.name === "state_id") {
      setDistrictsList([]);
      setBlocksList([]);
      setGramPanchayatList([]);
      const districts_details_list = geoLocations.data
        .filter((item) => item.parent_id === e.target.value)
        .sort((a, b) => a.name.localeCompare(b.name));

      setDistrictsList(districts_details_list);
    }

    if (e.target.name === "district_id") {
      setBlocksList([]);
      setGramPanchayatList([]);
      const blocks_details_list = geoLocations.data
        .filter((item) => item.parent_id === e.target.value)
        .sort((a, b) => a.name.localeCompare(b.name));

      setBlocksList(blocks_details_list);
    }

    if (e.target.name === "block_id") {
      setGramPanchayatList([]);
      const gp_details_list = GPLocations.data
        .filter((item) => item.block_id === e.target.value)
        .sort((a, b) => a.gp_name.localeCompare(b.gp_name));

      setTimeout(() => {
        setGramPanchayatList(gp_details_list);
      }, 100);
    }

    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  /*const handleGetLatLong = () => {
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
  };*/

  const validate = async () => {
    const errors = [
      { field: "state_id", message: "State Name is required" },
      { field: "district_id", message: "District Name is required" },
      { field: "block_id", message: "Block Name is required" },
      {
        field: "gram_panchayat_id",
        message: "Gram Panchayat Name is required",
      },
      { field: "gp_building", message: "GP Building is required" },
      { field: "gp_working_status", message: "GP Working Status is required" },
      { field: "surpanch_name", message: "Surpanch Name is required" },
      { field: "address", message: "Address is required" },
      { field: "mobile_no", message: "Mobile No. is required" },
      { field: "ont", message: "ONT Status is required" },
      { field: "ont_make_serial_no", message: "ONT Make S. No. is required" },
      { field: "electrical_power", message: "Electrical Power is required" },
      { field: "solar_panel", message: "Solar Panel status is required" },
      { field: "solar_serial_no", message: "Solar Serial No. is required" },
      { field: "solar_wire", message: "Solar Wire status is required" },
      { field: "battery", message: "Battery status is required" },
      {
        field: "battery_make_serial_no",
        message: "Battery Make S. No. is required",
      },
      { field: "ccu", message: "CCU status is required" },
      { field: "ccu_make_serial_no", message: "CCU Make S. No. is required" },
      { field: "earthing_status", message: "Earthing Status is required" },
      { field: "earthing_cable", message: "Earthing Cable status is required" },
      { field: "earthing", message: "Earthing status is required" },
      {
        field: "fibre_termination_box",
        message: "Fibre Termination Box status is required",
      },
      { field: "enclosure", message: "Enclosure status is required" },
      { field: "splitter", message: "Splitter type is required" },
      {
        field: "vle_captured_access",
        message: "VLE Captured/Access is required",
      },
      { field: "optical_power", message: "Optical Power status is required" },
      { field: "otdr", message: "OTDR is required" },
      {
        field: "optical_power_not_available_details",
        message: "OTDR Trace & Distance is required",
      },
      { field: "ont_ports_used", message: "No. of ONT ports used is required" },
      {
        field: "splitter_ports_used",
        message: "No. of Splitter ports used is required",
      },
      { field: "hoto_survey_date", message: "Date of HOTO Survey is required" },
      { field: "fiber", message: "Fiber status is required" },
    ];

    for (const error of errors) {
      if (!formData[error.field]) {
        toast.error(error.message);
        return false; // Stop validation after the first error
      }
    }
    return true;
  };

  /* const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid || images.length === 0) return;

    const formData = new FormData(e.target); // Initialize formData from the form

    // Convert images to Base64 before submitting
    const imagePromises = images.map((item) =>
      Promise.all(
        Object.entries(item).map(async ([key, value]) => {
          if (key === "imageName") return; // Skip imageName

          if (key.endsWith("_photo") && value instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(value);
              reader.onload = function () {
                formData.append(key, reader.result); // Append Base64 string to FormData
                resolve();
              };
            });
          } else if (key.endsWith("_photo") && !(value instanceof File)) {
            console.log("something going wrong...");
          } else {
            formData.append(key, value); // Append other fields
          }
        })
      )
    );

    await Promise.all(imagePromises); // Wait for all images to be processed

    // Cleanup formData before sending to API
    const gram_panchayat_id = formData.get("gram_panchayat_id");
    formData.delete("state_id");
    formData.delete("district_id");
    formData.delete("block_id");
    formData.delete("gram_panchayat_id");
    if(isOnline && isOnline?.isOnline === true) {
      try {
        const response = await api.post(
          `/gram-panchayat/${gram_panchayat_id}`,
          formData
        );
        toast.success("Survey submitted successfully!");
        // Reset Form and Images
        setImages([]);
        e.target.reset(); // Reset form fields
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit survey.");
      }
    } else {
      // here process all data & save in index database 

    }
    
  }; */

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid || images.length === 0) return;

    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData.entries());
    const gram_panchayat_id = formData.get("gram_panchayat_id");

    // Convert images to Base64 before submitting
    const imagePromises = images.map((item) =>
      Promise.all(
        Object.entries(item).map(async ([key, value]) => {
          if (key === "imageName") return;

          if ((key.endsWith("_photo") || key.endsWith("_image")) && value instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(value);
              reader.onload = function () {
                formDataObject[key] = reader.result;
                resolve();
              };
            });
          } else if (key.endsWith("_photo") && !(value instanceof File)) {
            console.log("something going wrong...");
          } else {
            formDataObject[key] = value;
          }
        })
      )
    );

    await Promise.all(imagePromises);

    // Remove unnecessary fields
    delete formDataObject.state_id;
    delete formDataObject.district_id;
    delete formDataObject.block_id;
    delete formDataObject.gram_panchayat_id;

    if (isOnline && isOnline?.isOnline === true) {
      try {
        const response = await api.post(
          `/gram-panchayat/${gram_panchayat_id}`,
          formDataObject
        );
        toast.success("Survey submitted successfully!");
        // Reset Form and Images
        setImages([]);
        e.target.reset();

        // Check and sync any pending offline data
        await syncPendingData();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit survey.");

        // If online submission fails, save to offline storage
        await addGPData({
          ...formDataObject,
          gram_panchayat_id,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Save to offline storage
      await addGPData({
        ...formDataObject,
        gram_panchayat_id,
        timestamp: new Date().toISOString(),
      });
      toast.success("Survey saved offline. Will sync when online.");
      setImages([]);
      e.target.reset();
    }
  };

  // Function to get file extension from MIME type
  /* const getFileExtension = (mimeType) => {
    const mimeToExtension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
      // Add more MIME type mappings as needed
    };
    return mimeToExtension[mimeType] || "file"; // Default to "file" if MIME type is unknown
  };*/

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Submit GP Master Details</h2>
      <div className="survey-form-wrapper">
        <form className="survey-form" onSubmit={handleSubmit}>
          {/* State Name */}
          <select
            className="form-select"
            name="state_id"
            onChange={handleChange}
          >
            <option value="">Select State</option>
            {stateList.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          {/* District Name */}
          <select
            className="form-select"
            name="district_id"
            onChange={handleChange}
          >
            <option value="">Select District</option>
            {districtsList.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>

          {/* Block Name */}
          <select
            className="form-select"
            name="block_id"
            onChange={handleChange}
          >
            <option value="">Select Block</option>
            {blocksList.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name}
              </option>
            ))}
          </select>

          {/* GP Name */}
          <select
            className="form-select"
            name="gram_panchayat_id"
            onChange={handleChange}
          >
            <option value="">Select GP Name</option>
            {gramPanchayatList.map((gp) => (
              <option key={"GP_" + gp.id} value={gp.id}>
                {gp.gp_name}
              </option>
            ))}
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="GP Name"
            openCameraLabel={"Upload GP Name Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New GP Name Image"}
            fieldName="gp_name_photo"
            latitudeFieldName={"gp_latitude"}
            longitudeFieldName={"gp_longitude"}
          />

          {/* GP Building */}
          <select
            className="form-select"
            name="gp_building"
            onChange={handleChange}
          >
            <option value="">Select GP Building</option>
            <option value="School">School</option>
            <option value="Gurudwara">Gurudwara</option>
            <option value="Panchayat Bhawan">Panchayat Bhawan</option>
            <option value="Other">Other</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="GP Building"
            openCameraLabel={"Upload GP Building Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New GP Building Image"}
            fieldName="gp_building_photo"
            latitudeFieldName={"gp_building_latitude"}
            longitudeFieldName={"gp_building_longitude"}
          />

          {/* GP Working Status */}
          <select
            className="form-select"
            name="gp_working_status"
            onChange={handleChange}
          >
            <option value="">Select GP Working Status</option>
            <option value="UP">UP</option>
            <option value="DOWN">DOWN</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="GP Status"
            openCameraLabel={"Upload GP Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New GP Status Image"}
            fieldName="gp_working_status_photo"
            latitudeFieldName={"gp_working_status_latitude"}
            longitudeFieldName={"gp_working_status_longitude"}
          />

          {/* Surpanch Name */}
          <input
            type="text"
            className="form-input"
            name="surpanch_name"
            placeholder="Enter Surpanch Name"
            onChange={handleChange}
          />

          {/* Address */}
          <input
            type="text"
            className="form-input"
            name="address"
            placeholder="Enter Address"
            onChange={handleChange}
          />

          {/* Mobile No. */}
          <input
            type="text"
            className="form-input"
            name="mobile_no"
            placeholder="Enter Mobile No."
            onChange={handleChange}
          />

          {/* ONT Status */}
          <select className="form-select" name="ont" onChange={handleChange}>
            <option value="">Select ONT Status</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Missing">Missing</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="ONT Status"
            openCameraLabel={"Upload ONT Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New ONT Image"}
            fieldName="ont_photo"
            latitudeFieldName="ont_latitude"
            longitudeFieldName="ont_longitude"
          />

          {/* ONT Make S. No. */}
          <input
            type="text"
            className="form-input"
            name="ont_make_serial_no"
            placeholder="Enter ONT Make S. No."
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="ONT Make S. No."
            openCameraLabel={"Upload ONT Make S. No. Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New ONT Image"}
            fieldName="ont_make_serial_no_photo"
            latitudeFieldName={"ont_make_serial_no_photo_latitude"}
            longitudeFieldName={"ont_make_serial_no_photo_longitude"}
          />

          {/* Electrical Power */}
          <select
            className="form-select"
            name="electrical_power"
            onChange={handleChange}
          >
            <option value="">Select Electrical Power</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Electrical Power"
            openCameraLabel={"Upload Electrical Power Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Electrical Power Image"}
            fieldName="electrical_power_photo"
            latitudeFieldName={"electrical_power_latitude"}
            longitudeFieldName={"electrical_power_longitude"}
          />

          {/* Solar Panel */}
          <select
            className="form-select"
            name="solar_panel"
            onChange={handleChange}
          >
            <option value="">Select Solar Panel Status</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Missing">Missing</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Solar Panel"
            openCameraLabel={"Upload Solar Panel Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Solar Panel Image"}
            fieldName="solar_panel_photo"
            latitudeFieldName={"solar_panel_latitude"}
            longitudeFieldName={"solar_panel_longitude"}
          />

          {/* Solar Serial No. */}
          <input
            type="text"
            className="form-input"
            name="solar_serial_no"
            placeholder="Enter Solar Serial No."
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Solar Serial No."
            openCameraLabel={"Upload Solar Serial No. Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Solar Serial No. Image"}
            fieldName="solar_panel_serial_no_photo"
            latitudeFieldName={"solar_panel_serial_no_photo_latitude"}
            longitudeFieldName={"solar_panel_serial_no_photo_longitude"}
          />

          {/* Solar Wire */}
          <select
            className="form-select"
            name="solar_wire"
            onChange={handleChange}
          >
            <option value="">Select Solar Wire Status</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Missing">Missing</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Solar Wire"
            openCameraLabel={"Upload Solar Wire Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Solar Wire Image"}
            fieldName="solar_wire_photo"
            latitudeFieldName={"solar_wire_latitude"}
            longitudeFieldName={"solar_wire_longitude"}
          />

          {/* Battery */}
          <select
            className="form-select"
            name="battery"
            onChange={handleChange}
          >
            <option value="">Select Battery Status</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Missing">Missing</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Battery"
            openCameraLabel={"Upload Battery Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Battery Image"}
            fieldName="battery_photo"
            latitudeFieldName={"battery_latitude"}
            longitudeFieldName={"battery_longitude"}
          />

          {/* Battery Make S. No. */}
          <input
            type="text"
            className="form-input"
            name="battery_make_serial_no"
            placeholder="Enter Battery Make S. No."
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Battery Make S. No."
            openCameraLabel={"Upload Battery  Make S. No. Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Battery  Make S. No. Image"}
            fieldName="battery_make_serial_no_photo"
            latitudeFieldName={"battery_make_serial_no_photo_latitude"}
            longitudeFieldName={"battery_make_serial_no_photo_longitude"}
          />

          {/* CCU */}
          <select className="form-select" name="ccu" onChange={handleChange}>
            <option value="">Select CCU Status</option>
            <option value="Working">Working</option>
            <option value="Faulty">Faulty</option>
            <option value="Missing">Missing</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CCU"
            openCameraLabel={"Upload CCU Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CCU Image"}
            fieldName="ccu_photo"
            latitudeFieldName={"ccu_latitude"}
            longitudeFieldName={"ccu_longitude"}
          />

          {/* CCU Make S. No. */}
          <input
            type="text"
            className="form-input"
            name="ccu_make_serial_no"
            placeholder="Enter CCU Make S. No."
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CCU Make S. No."
            openCameraLabel={"Upload CCU Make S. No. Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CCU Make S. No. Image"}
            fieldName="ccu_make_serial_no_photo"
            latitudeFieldName={"ccu_make_serial_no_photo_latitude"}
            longitudeFieldName={"ccu_make_serial_no_photo_longitude"}
          />

          {/* Earthing */}
          <select
            className="form-select"
            name="earthing"
            onChange={handleChange}
          >
            <option value="">Select Earthing Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Cable Status"
            openCameraLabel={"Upload Cable Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Cable Status Image"}
            fieldName="earthing_photo"
            latitudeFieldName={"earthing_photo_latitude"}
            longitudeFieldName={"earthing_photo_longitude"}
          />

          {/* Earthing cable Status */}
          <select
            className="form-select"
            name="earthing_cable"
            onChange={handleChange}
          >
            <option value="">Select Earthing Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Earthing Status"
            openCameraLabel={"Upload Earthing Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Earthing Status Image"}
            fieldName="earthing_cable_photo"
            latitudeFieldName={"earthing_cable_photo_latitude"}
            longitudeFieldName={"earthing_cable_photo_longitude"}
          />

          {/* Earthing Cable */}
          <select
            className="form-select"
            name="earthing_status"
            onChange={handleChange}
          >
            <option value="">Select Earthing Status</option>
            <option value="Working">Working</option>
            <option value="Not Working">Not Working</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Earthing Status"
            openCameraLabel={"Upload Earthing Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Earthing Status Image"}
            fieldName="earthing_status_photo"
            latitudeFieldName={"earthing_status_latitude"}
            longitudeFieldName={"earthing_status_longitude"}
          />

          {/* Fibre Termination Box */}
          <select
            className="form-select"
            name="fibre_termination_box"
            onChange={handleChange}
          >
            <option value="">Select Fibre Termination Box Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Fibre Termination Box"
            openCameraLabel={"Upload Fibre Termination Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Image"}
            fieldName="termination_box_photo"
            latitudeFieldName={"termination_box_photo_latitude"}
            longitudeFieldName={"termination_box_photo_longitude"}
          />

          {/* Enclosure */}
          <select
            className="form-select"
            name="enclosure"
            onChange={handleChange}
          >
            <option value="">Select Enclosure Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Enclosure"
            openCameraLabel={"Upload Enclosure Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Enclosure Image"}
            fieldName="enclosure_status_photo"
            latitudeFieldName={"enclosure_status_photo_latitude"}
            longitudeFieldName={"enclosure_status_photo_longitude"}
          />

          {/* Splitter */}
          <select
            className="form-select"
            name="splitter"
            onChange={handleChange}
          >
            <option value="">Select Splitter</option>
            <option value="1:2">1:2</option>
            <option value="1:4">1:4</option>
            <option value="1:8">1:8</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Splitter"
            openCameraLabel={"Upload Splitter Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Splitter Image"}
            fieldName="splitter_photo"
            latitudeFieldName={"splitter_photo_latitude"}
            longitudeFieldName={"splitter_photo_longitude"}
          />

          {/* VLE Captured/Access */}
          <input
            type="text"
            className="form-input"
            name="vle_captured_access"
            placeholder="Enter VLE Captured/Access"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="VLE Captured/Access"
            openCameraLabel={"Upload VLE Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New VLE  Image"}
            fieldName="vle_captured_access_photo"
            latitudeFieldName={"vle_captured_access_photo_latitude"}
            longitudeFieldName={"vle_captured_access_photo_longitude"}
          />

          {/* Optical Power */}
          <select
            className="form-select"
            name="optical_power"
            onChange={handleChange}
          >
            <option value="">Select Optical Power</option>
            <option value="OK">OK</option>
            <option value="Not OK">Not OK</option>
            <option value="Not installed">Not installed</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Optical Power"
            openCameraLabel={"Upload Optical Power Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Optical Power Image"}
            fieldName="optical_power_photo"
            latitudeFieldName={"optical_power_photo_latitude"}
            longitudeFieldName={"optical_power_photo_longitude"}
          />

          {/* OTDR */}
          <input
            type="text"
            className="form-input"
            name="otdr"
            placeholder="Enter OTDR"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="OTDR"
            openCameraLabel={"Upload OTDR Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New OTDR Image"}
            fieldName="otdr_image"
            latitudeFieldName={"otdr_image_latitude"}
            longitudeFieldName={"otdr_image_longitude"}
          />

          {/* OTDR Trace & Distance */}
          <input
            type="text"
            className="form-input"
            name="optical_power_not_available_details"
            placeholder="Enter OTDR Trace & Distance"
            onChange={handleChange}
          />

          {/* No. of ONT ports used */}
          <input
            type="text"
            className="form-input"
            name="ont_ports_used"
            placeholder="Enter No. of ONT ports used"
            onChange={handleChange}
          />

          {/* No. of Splitter ports used */}
          <input
            type="text"
            className="form-input"
            name="splitter_ports_used"
            placeholder="Enter No. of Splitter ports used"
            onChange={handleChange}
          />

          {/* Date of HOTO Survey */}
          <input
            type="date"
            format="YYYY-MM-DD"
            className="form-input"
            name="hoto_survey_date"
            onChange={handleChange}
            value={formData?.hoto_survey_date}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="HOTO Survey"
            openCameraLabel={"Upload HOTO Survey Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New HOTO Survey Image"}
            fieldName="hoto_survey_photo"
            latitudeFieldName={"hoto_survey_photo_latitude"}
            longitudeFieldName={"hoto_survey_photo_longitude"}
          />

          {/* Fiber */}
          <select className="form-select" name="fiber" onChange={handleChange}>
            <option value="">Select Fiber Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>

          {/* Capture Lat/Long Button */}
          {/* <button
            type="button"
            className="form-button"
            onClick={handleGetLatLong}
          >
            Capture GP Location Lat/Long
          </button>
          {formData.latLong && <p>Captured GP Location Lat/Long: {formData.latLong}</p>} */}

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Fiber"
            openCameraLabel={"Upload Fiber Status Image"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Fiber Status Image"}
            fieldName="fiber_photo"
            latitudeFieldName={"fiber_photo_latitude"}
            longitudeFieldName={"fiber_photo_longitude"}
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

export default GPMasterDetail;
