import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";
import api from "../utils/api";
import geoLocations from "../utils/geo_locations.json";
import { addPlanningData, syncPendingPlanningData, getAllPlanningData } from "../utils/idbHelper";

const PlanningScreenDetail = () => {
  const [images, setImages] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeSegment, setActiveSegment] = useState(1); // Track which segment is active

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
    const fetchGEOLocationDetails = async () => {
      try {
        const state_details_list = geoLocations.data
          .filter((item) => item.parent_id === null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setStateList(state_details_list);
      } catch (err) {
        console.log("geo_details_list errors: ", err);
      }
    };

    fetchGEOLocationDetails();
  }, []);

  /** Sync data to the server based on isOnline */
  useEffect(() => {
    if (isOnline) {
      const fetchAllSavedPlanningData = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const savedPlanningData = await getAllPlanningData();
        console.log('getSavedAllPlanningData', savedPlanningData);
        syncPendingPlanningData();
      };

      fetchAllSavedPlanningData();
    }
  }, [isOnline]);

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
    const imageBlob = formData.get(fieldName || "image");
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
      const newImage = {
        [fieldName]: imageBlob,
        [latitudeFieldName]: latitude,
        [longitudeFieldName]: longitude,
        imageName,
      };

      // Check if the image already exists
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

  // Handle removal of image
  const handleRemove = (imageName) => {
    setImages(images.filter((img) => img.imageName !== imageName));
  };

  const [formData, setFormData] = useState({
    district_id: "",
    block_id: "",
    ring_id: "",
    // Segment 1
    seg1_start_lat: "",
    seg1_start_long: "",
    seg1_start_l2_file: "",
    seg1_end_lat: "",
    seg1_end_long: "",
    seg1_end_l2_file: "",
    seg1_route_direction: "",
    seg1_road_surface: "",
    seg1_road_width_mtr: "",
    seg1_road_type: "",
    seg1_landmark1_type: "",
    seg1_landmark1_lat: "",
    seg1_landmark1_long: "",
    seg1_landmark1_l2_file: "",
    seg1_landmark2_type: "",
    seg1_landmark2_lat: "",
    seg1_landmark2_long: "",
    seg1_landmark2_l2_file: "",
    seg1_landmark3_type: "",
    seg1_landmark3_lat: "",
    seg1_landmark3_long: "",
    seg1_landmark3_l2_file: "",
    seg1_landmark4_type: "",
    seg1_landmark4_lat: "",
    seg1_landmark4_long: "",
    seg1_landmark4_l2_file: "",
    // Segment 2
    seg2_start_lat: "",
    seg2_start_long: "",
    seg2_start_l2_file: "",
    seg2_end_lat: "",
    seg2_end_long: "",
    seg2_end_l2_file: "",
    seg2_route_direction: "",
    seg2_road_surface: "",
    seg2_road_width_mtr: "",
    seg2_road_type: "",
    seg2_landmark1_type: "",
    seg2_landmark1_lat: "",
    seg2_landmark1_long: "",
    seg2_landmark1_l2_file: "",
    seg2_landmark2_type: "",
    seg2_landmark2_lat: "",
    seg2_landmark2_long: "",
    seg2_landmark2_l2_file: "",
    seg2_landmark3_type: "",
    seg2_landmark3_lat: "",
    seg2_landmark3_long: "",
    seg2_landmark3_l2_file: "",
    seg2_landmark4_type: "",
    seg2_landmark4_lat: "",
    seg2_landmark4_long: "",
    seg2_landmark4_l2_file: "",
    // Segment 3
    seg3_start_lat: "",
    seg3_start_long: "",
    seg3_start_l2_file: "",
    seg3_end_lat: "",
    seg3_end_long: "",
    seg3_end_l2_file: "",
    seg3_route_direction: "",
    seg3_road_surface: "",
    seg3_road_width_mtr: "",
    seg3_road_type: "",
    seg3_landmark1_type: "",
    seg3_landmark1_lat: "",
    seg3_landmark1_long: "",
    seg3_landmark1_l2_file: "",
    seg3_landmark2_type: "",
    seg3_landmark2_lat: "",
    seg3_landmark2_long: "",
    seg3_landmark2_l2_file: "",
    seg3_landmark3_type: "",
    seg3_landmark3_lat: "",
    seg3_landmark3_long: "",
    seg3_landmark3_l2_file: "",
    seg3_landmark4_type: "",
    seg3_landmark4_lat: "",
    seg3_landmark4_long: "",
    seg3_landmark4_l2_file: "",
    // Segment 4
    seg4_start_lat: "",
    seg4_start_long: "",
    seg4_start_l2_file: "",
    seg4_end_lat: "",
    seg4_end_long: "",
    seg4_end_l2_file: "",
    // Segment 5
    seg5_start_lat: "",
    seg5_start_long: "",
    seg5_start_l2_file: "",
    seg5_end_lat: "",
    seg5_end_long: "",
    seg5_end_l2_file: ""
  });

  const handleChange = (e) => {
    if (e.target.name === "state_id") {
      setDistrictsList([]);
      setBlocksList([]);
      const districts_details_list = geoLocations.data
        .filter((item) => item.parent_id === e.target.value)
        .sort((a, b) => a.name.localeCompare(b.name));

      setDistrictsList(districts_details_list);
    }

    if (e.target.name === "district_id") {
      setBlocksList([]);
      const blocks_details_list = geoLocations.data
        .filter((item) => item.parent_id === e.target.value)
        .sort((a, b) => a.name.localeCompare(b.name));

      setBlocksList(blocks_details_list);
    }

    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validate = async () => {
    const errors = [
      { field: "district_id", message: "District Name is required" },
      { field: "block_id", message: "Block Name is required" },
      { field: "ring_id", message: "Ring ID is required" },
    ];

    // Validate current active segment
    const segmentErrors = [
      { field: `seg${activeSegment}_start_lat`, message: `Segment ${activeSegment} Start Latitude is required` },
      { field: `seg${activeSegment}_start_long`, message: `Segment ${activeSegment} Start Longitude is required` },
      { field: `seg${activeSegment}_end_lat`, message: `Segment ${activeSegment} End Latitude is required` },
      { field: `seg${activeSegment}_end_long`, message: `Segment ${activeSegment} End Longitude is required` },
      { field: `seg${activeSegment}_route_direction`, message: `Segment ${activeSegment} Route Direction is required` },
      { field: `seg${activeSegment}_road_surface`, message: `Segment ${activeSegment} Road Surface is required` },
      { field: `seg${activeSegment}_road_width_mtr`, message: `Segment ${activeSegment} Road Width is required` },
      { field: `seg${activeSegment}_road_type`, message: `Segment ${activeSegment} Road Type is required` },
    ];

    for (const error of [...errors, ...segmentErrors]) {
      if (!formData[error.field]) {
        toast.error(error.message);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid || images.length === 0) return;

    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData.entries());
    const block_id = formData.get("block_id");

    // Convert images to Base64 before submitting
    const imagePromises = images.map((item) =>
      Promise.all(
        Object.entries(item).map(async ([key, value]) => {
          if (key === "imageName") return;

          if ((key.endsWith("_photo") || key.endsWith("_l2_file") || key.endsWith("_image")) && value instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(value);
              reader.onload = function () {
                formDataObject[key] = reader.result;
                resolve();
              };
            });
          } else if ((key.endsWith("_photo") || key.endsWith("_l2_file")) && !(value instanceof File)) {
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

    if (isOnline && isOnline?.isOnline === true) {
      try {
        const response = await api.post(
          `/save-planning-screen-detail`,
          formDataObject
        );
        toast.success("Planning details submitted successfully!");
        // Reset Form and Images
        setImages([]);
        e.target.reset();

        // Check and sync any pending offline data
        await syncPendingPlanningData();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit planning details.");

        // If online submission fails, save to offline storage
        await addPlanningData({
          ...formDataObject,
          block_id,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Save to offline storage
      await addPlanningData({
        ...formDataObject,
        block_id,
        timestamp: new Date().toISOString(),
      });
      toast.success("Planning details saved offline. Will sync when online.");
      setImages([]);
      e.target.reset();
    }
  };

  const renderSegmentFields = (segmentNumber) => {
    return (
      <div className="segment-container" key={`segment-${segmentNumber}`}>
        <h3>Segment {segmentNumber} Details</h3>
        
        {/* Start MH */}
        <div className="form-group">
          <label>New OFC Seg {segmentNumber} Start MH</label>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName={`Seg${segmentNumber} Start MH`}
            openCameraLabel={`Upload Seg${segmentNumber} Start MH Image`}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={`Upload New Seg${segmentNumber} Start MH Image`}
            fieldName={`seg${segmentNumber}_start_l2_file`}
            latitudeFieldName={`seg${segmentNumber}_start_lat`}
            longitudeFieldName={`seg${segmentNumber}_start_long`}
          />
        </div>

        {/* End MH */}
        <div className="form-group">
          <label>New OFC Seg {segmentNumber} End MH</label>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName={`Seg${segmentNumber} End MH`}
            openCameraLabel={`Upload Seg${segmentNumber} End MH Image`}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={`Upload New Seg${segmentNumber} End MH Image`}
            fieldName={`seg${segmentNumber}_end_l2_file`}
            latitudeFieldName={`seg${segmentNumber}_end_lat`}
            longitudeFieldName={`seg${segmentNumber}_end_long`}
          />
        </div>

        {/* Route Direction */}
        <div className="form-group">
          <label>Route Direction</label>
          <select
            className="form-select"
            name={`seg${segmentNumber}_route_direction`}
            onChange={handleChange}
          >
            <option value="">Select Route Direction</option>
            <option value="RHS">RHS</option>
            <option value="LHS">LHS</option>
          </select>
        </div>

        {/* Road Surface */}
        <div className="form-group">
          <label>Road Surface</label>
          <select
            className="form-select"
            name={`seg${segmentNumber}_road_surface`}
            onChange={handleChange}
          >
            <option value="">Select Road Surface</option>
            <option value="Bitumen">Bitumen</option>
            <option value="C.C.">C.C.</option>
            <option value="Kachcha">Kachcha</option>
            <option value="Bricks">Bricks</option>
          </select>
        </div>

        {/* Road Width */}
        <div className="form-group">
          <label>Road Width (MTR)</label>
          <input
            type="text"
            className="form-input"
            name={`seg${segmentNumber}_road_width_mtr`}
            placeholder="Enter Road Width"
            onChange={handleChange}
          />
        </div>

        {/* Road Type */}
        <div className="form-group">
          <label>Road Type</label>
          <select
            className="form-select"
            name={`seg${segmentNumber}_road_type`}
            onChange={handleChange}
          >
            <option value="">Select Road Type</option>
            <option value="NHAI">NHAI</option>
            <option value="State Highway">State Highway</option>
            <option value="Forest">Forest</option>
            <option value="Village Road">Village Road</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Landmarks (1-4) */}
        {[1, 2, 3, 4].map((landmarkNum) => (
          <div key={`landmark-${segmentNumber}-${landmarkNum}`} className="landmark-group">
            <label>Landmark {landmarkNum} (if any)</label>
            <select
              className="form-select"
              name={`seg${segmentNumber}_landmark${landmarkNum}_type`}
              onChange={handleChange}
            >
              <option value="">Select Landmark Type</option>
              <option value="Culvert">Culvert</option>
              <option value="Railway crossing">Railway crossing</option>
              <option value="BSNL RI">BSNL RI</option>
              <option value="BSNL Manhole">BSNL Manhole</option>
            </select>

            {formData[`seg${segmentNumber}_landmark${landmarkNum}_type`] && (
              <CameraComponent
                onCapture={handleCapture}
                onRemove={handleRemove}
                imageName={`Seg${segmentNumber} Landmark ${landmarkNum}`}
                openCameraLabel={`Upload Seg${segmentNumber} Landmark ${landmarkNum} Image`}
                captureImageLabel={"Capture image"}
                useImageLabel={"Use image"}
                removeImageLabel={"Remove Image"}
                reUploadLabel={`Upload New Seg${segmentNumber} Landmark ${landmarkNum} Image`}
                fieldName={`seg${segmentNumber}_landmark${landmarkNum}_l2_file`}
                latitudeFieldName={`seg${segmentNumber}_landmark${landmarkNum}_lat`}
                longitudeFieldName={`seg${segmentNumber}_landmark${landmarkNum}_long`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Planning Screen Details</h2>
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
            disabled={!formData.state_id}
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
            disabled={!formData.district_id}
          >
            <option value="">Select Block</option>
            {blocksList.map((block) => (
              <option key={block.id} value={block.id}>
                {block.name}
              </option>
            ))}
          </select>

          {/* Ring ID */}
          <select
            className="form-select"
            name="ring_id"
            onChange={handleChange}
          >
            <option value="">Select Ring ID</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="CR1">CR1</option>
            <option value="CR2">CR2</option>
            <option value="CR3">CR3</option>
            <option value="CR4">CR4</option>
          </select>

          {/* Segment Navigation */}
          <div className="segment-navigation">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={`segment-nav-${num}`}
                type="button"
                className={`segment-nav-btn ${activeSegment === num ? 'active' : ''}`}
                onClick={() => setActiveSegment(num)}
              >
                Segment {num}
              </button>
            ))}
          </div>

          {/* Render active segment fields */}
          {renderSegmentFields(activeSegment)}

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

export default PlanningScreenDetail;