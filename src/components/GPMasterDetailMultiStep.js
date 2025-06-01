import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";
import api from "../utils/api";

const GPMasterDetailMultiStep = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [gramPanchayatList, setGramPanchayatList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGPDetails = async () => {
      try {
        const response = await api.get("/gp-details/882");
        const gp_details_list = response?.data.data;
        setGramPanchayatList(gp_details_list);
      } catch (err) {
        console.log("gp_details_list errors: ", err);
      }
    };

    fetchGPDetails();
  }, []);

  const handleCapture = (
    formData,
    imageName,
    fieldName,
    latitudeFieldName,
    longitudeFieldName
  ) => {
    console.log("Handling captured image...");

    const imageBlob = formData.get(fieldName || "image");
    console.log("Image Blob:", imageBlob);

    if (!imageBlob) {
      console.error("Image Blob is undefined or null.");
      return;
    }

    const latitude = formData.get(latitudeFieldName);
    const longitude = formData.get(longitudeFieldName);

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = {
        [fieldName]: imageBlob,
        [latitudeFieldName]: latitude,
        [longitudeFieldName]: longitude,
        imageName,
      };

      const imageExists = images.some((img) => img.imageName === imageName);

      if (!imageExists) {
        setImages([...images, newImage]);
      } else {
        setImages(
          images.map((img) => (img.imageName === imageName ? newImage : img))
        );
      }
    };

    reader.onerror = (err) => {
      console.error("Error reading image blob:", err);
    };

    reader.readAsDataURL(imageBlob);
  };

  const handleRemove = (imageName) => {
    setImages(images.filter((img) => img.imageName !== imageName));
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    district_id: "28",
    block_id: "882",
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
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validateStep = (step) => {
    const stepValidations = {
      1: [
        { field: "district_id", message: "District Name is required" },
        { field: "block_id", message: "Block Name is required" },
        { field: "gram_panchayat_id", message: "Gram Panchayat Name is required" },
      ],
      2: [
        { field: "gp_building", message: "GP Building is required" },
        { field: "gp_working_status", message: "GP Working Status is required" },
      ],
      3: [
        { field: "surpanch_name", message: "Surpanch Name is required" },
        { field: "address", message: "Address is required" },
        { field: "mobile_no", message: "Mobile No. is required" },
      ],
      4: [
        { field: "ont", message: "ONT Status is required" },
        { field: "ont_make_serial_no", message: "ONT Make S. No. is required" },
      ],
      5: [
        { field: "electrical_power", message: "Electrical Power is required" },
        { field: "solar_panel", message: "Solar Panel status is required" },
        { field: "solar_serial_no", message: "Solar Serial No. is required" },
        { field: "solar_wire", message: "Solar Wire status is required" },
      ],
      6: [
        { field: "battery", message: "Battery status is required" },
        { field: "battery_make_serial_no", message: "Battery Make S. No. is required" },
        { field: "ccu", message: "CCU status is required" },
        { field: "ccu_make_serial_no", message: "CCU Make S. No. is required" },
      ],
      7: [
        { field: "earthing_status", message: "Earthing Status is required" },
        { field: "earthing_cable", message: "Earthing Cable status is required" },
        { field: "earthing", message: "Earthing status is required" },
      ],
      8: [
        { field: "fibre_termination_box", message: "Fibre Termination Box status is required" },
        { field: "enclosure", message: "Enclosure status is required" },
        { field: "splitter", message: "Splitter type is required" },
      ],
      9: [
        { field: "vle_captured_access", message: "VLE Captured/Access is required" },
        { field: "optical_power", message: "Optical Power status is required" },
        { field: "otdr", message: "OTDR is required" },
      ],
      10: [
        { field: "optical_power_not_available_details", message: "OTDR Trace & Distance is required" },
        { field: "ont_ports_used", message: "No. of ONT ports used is required" },
        { field: "splitter_ports_used", message: "No. of Splitter ports used is required" },
      ],
      11: [
        { field: "hoto_survey_date", message: "Date of HOTO Survey is required" },
        { field: "fiber", message: "Fiber status is required" },
      ]
    };

    const errors = stepValidations[step] || [];
    for (const error of errors) {
      if (!formData[error.field]) {
        toast.error(error.message);
        return false;
      }
    }
    return true;
  };

  const handleSaveStep = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add current step data to formData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          formDataToSend.append(key, value);
        }
      });

      // Add images related to current step
      images.forEach((image) => {
        Object.entries(image).forEach(([key, value]) => {
          if (key !== "imageName" && value) {
            formDataToSend.append(key, value);
          }
        });
      });

      // Save the current step
      await api.post("/save-gp-step", formDataToSend);
      toast.success(`Step ${currentStep} saved successfully!`);
      
      // Move to next step if not the last step
      if (currentStep < 11) {
        setCurrentStep(currentStep + 1);
      } else {
        toast.success("All steps completed successfully!");
      }
    } catch (error) {
      console.error("Error saving step:", error);
      toast.error("Failed to save step.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h3>Step 1: Basic Information</h3>
            <select
              className="form-select"
              name="district_id"
              onChange={handleChange}
              defaultValue={79}
            >
              <option value="">Select District</option>
              <option value="79">Kapurthala</option>
            </select>

            <select
              className="form-select"
              name="block_id"
              onChange={handleChange}
              defaultValue={882}
            >
              <option value="">Select Block</option>
              <option value="882">Sultanpur Lodhi</option>
            </select>

            <select
              className="form-select"
              name="gram_panchayat_id"
              onChange={handleChange}
              value={formData.gram_panchayat_id}
            >
              <option value="">Select GP Name</option>
              {gramPanchayatList.map((gp) => (
                <option key={gp.id} value={gp.id}>
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
          </>
        );
      case 2:
        return (
          <>
            <h3>Step 2: GP Building Information</h3>
            <select
              className="form-select"
              name="gp_building"
              onChange={handleChange}
              value={formData.gp_building}
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

            <select
              className="form-select"
              name="gp_working_status"
              onChange={handleChange}
              value={formData.gp_working_status}
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
          </>
        );
      case 3:
        return (
          <>
            <h3>Step 3: Contact Information</h3>
            <input
              type="text"
              className="form-input"
              name="surpanch_name"
              placeholder="Enter Surpanch Name"
              onChange={handleChange}
              value={formData.surpanch_name}
            />

            <input
              type="text"
              className="form-input"
              name="address"
              placeholder="Enter Address"
              onChange={handleChange}
              value={formData.address}
            />

            <input
              type="text"
              className="form-input"
              name="mobile_no"
              placeholder="Enter Mobile No."
              onChange={handleChange}
              value={formData.mobile_no}
            />
          </>
        );
      case 4:
        return (
          <>
            <h3>Step 4: ONT Information</h3>
            <select 
              className="form-select" 
              name="ont" 
              onChange={handleChange}
              value={formData.ont}
            >
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

            <input
              type="text"
              className="form-input"
              name="ont_make_serial_no"
              placeholder="Enter ONT Make S. No."
              onChange={handleChange}
              value={formData.ont_make_serial_no}
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
          </>
        );
      case 5:
        return (
          <>
            <h3>Step 5: Power Information</h3>
            <select
              className="form-select"
              name="electrical_power"
              onChange={handleChange}
              value={formData.electrical_power}
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

            <select
              className="form-select"
              name="solar_panel"
              onChange={handleChange}
              value={formData.solar_panel}
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

            <input
              type="text"
              className="form-input"
              name="solar_serial_no"
              placeholder="Enter Solar Serial No."
              onChange={handleChange}
              value={formData.solar_serial_no}
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

            <select
              className="form-select"
              name="solar_wire"
              onChange={handleChange}
              value={formData.solar_wire}
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
          </>
        );
      case 6:
        return (
          <>
            <h3>Step 6: Battery & CCU Information</h3>
            <select
              className="form-select"
              name="battery"
              onChange={handleChange}
              value={formData.battery}
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

            <input
              type="text"
              className="form-input"
              name="battery_make_serial_no"
              placeholder="Enter Battery Make S. No."
              onChange={handleChange}
              value={formData.battery_make_serial_no}
            />

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="Battery Make S. No."
              openCameraLabel={"Upload Battery Make S. No. Image"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New Battery Make S. No. Image"}
              fieldName="battery_make_serial_no_photo"
              latitudeFieldName={"battery_make_serial_no_photo_latitude"}
              longitudeFieldName={"battery_make_serial_no_photo_longitude"}
            />

            <select 
              className="form-select" 
              name="ccu" 
              onChange={handleChange}
              value={formData.ccu}
            >
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

            <input
              type="text"
              className="form-input"
              name="ccu_make_serial_no"
              placeholder="Enter CCU Make S. No."
              onChange={handleChange}
              value={formData.ccu_make_serial_no}
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
          </>
        );
      case 7:
        return (
          <>
            <h3>Step 7: Earthing Information</h3>
            <select
              className="form-select"
              name="earthing"
              onChange={handleChange}
              value={formData.earthing}
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

            <select
              className="form-select"
              name="earthing_cable"
              onChange={handleChange}
              value={formData.earthing_cable}
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

            <select
              className="form-select"
              name="earthing_status"
              onChange={handleChange}
              value={formData.earthing_status}
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
          </>
        );
      case 8:
        return (
          <>
            <h3>Step 8: Termination & Enclosure</h3>
            <select
              className="form-select"
              name="fibre_termination_box"
              onChange={handleChange}
              value={formData.fibre_termination_box}
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

            <select
              className="form-select"
              name="enclosure"
              onChange={handleChange}
              value={formData.enclosure}
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

            <select
              className="form-select"
              name="splitter"
              onChange={handleChange}
              value={formData.splitter}
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
          </>
        );
      case 9:
        return (
          <>
            <h3>Step 9: VLE & Optical Information</h3>
            <input
              type="text"
              className="form-input"
              name="vle_captured_access"
              placeholder="Enter VLE Captured/Access"
              onChange={handleChange}
              value={formData.vle_captured_access}
            />

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="VLE Captured/Access"
              openCameraLabel={"Upload VLE Image"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New VLE Image"}
              fieldName="vle_captured_access_photo"
              latitudeFieldName={"vle_captured_access_photo_latitude"}
              longitudeFieldName={"vle_captured_access_photo_longitude"}
            />

            <select
              className="form-select"
              name="optical_power"
              onChange={handleChange}
              value={formData.optical_power}
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

            <input
              type="text"
              className="form-input"
              name="otdr"
              placeholder="Enter OTDR"
              onChange={handleChange}
              value={formData.otdr}
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
          </>
        );
      case 10:
        return (
          <>
            <h3>Step 10: Ports Information</h3>
            <input
              type="text"
              className="form-input"
              name="optical_power_not_available_details"
              placeholder="Enter OTDR Trace & Distance"
              onChange={handleChange}
              value={formData.optical_power_not_available_details}
            />

            <input
              type="text"
              className="form-input"
              name="ont_ports_used"
              placeholder="Enter No. of ONT ports used"
              onChange={handleChange}
              value={formData.ont_ports_used}
            />

            <input
              type="text"
              className="form-input"
              name="splitter_ports_used"
              placeholder="Enter No. of Splitter ports used"
              onChange={handleChange}
              value={formData.splitter_ports_used}
            />
          </>
        );
      case 11:
        return (
          <>
            <h3>Step 11: Survey & Fiber Information</h3>
            <input
              type="date"
              format="YYYY-MM-DD"
              className="form-input"
              name="hoto_survey_date"
              onChange={handleChange}
              value={formData.hoto_survey_date}
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

            <select 
              className="form-select" 
              name="fiber" 
              onChange={handleChange}
              value={formData.fiber}
            >
              <option value="">Select Fiber Status</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>

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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Submit GP Master Details</h2>
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${(currentStep / 11) * 100}%` }}
        ></div>
      </div>
      <div className="step-indicator">
        Step {currentStep} of 11
      </div>
      
      <div className="survey-form-wrapper">
        <form className="survey-form" onSubmit={handleSaveStep}>
          {renderStep()}
          
          <div className="form-navigation">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="form-button prev-button"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            {currentStep < 11 ? (
              <button 
                type="button" 
                className="form-button next-button"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : null}
            
            <button 
              type="submit" 
              className="form-button save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Step"}
            </button>
            
            {currentStep === 11 && (
              <button 
                type="button" 
                className="form-button complete-button"
                onClick={() => toast.success("All steps completed successfully!")}
              >
                Complete
              </button>
            )}
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GPMasterDetailMultiStep;