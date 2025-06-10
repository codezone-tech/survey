import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";
import api from "../utils/api";
import geoLocations from "../utils/geo_locations.json";
import { addDamageFiberData, syncPendingDamageFiberData, getAllDamageFiberData } from "../utils/idbHelper";

const DamageFiberDetail = () => {
  const [images, setImages] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
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
        console.log("state_details_list errors: ", err);
      }
    };

    fetchGEOLocationDetails();
  }, []);

  useEffect(() => {
    if (isOnline) {
      const fetchAllSavedFiberData = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const savedFiberData = await getAllDamageFiberData();
        console.log('getSavedAllFiberData', savedFiberData);
        syncPendingDamageFiberData();
      };
  
      fetchAllSavedFiberData();
    }
  }, [isOnline]);

  const handleCapture = (
    formData,
    imageName,
    fieldName,
    latitudeFieldName,
    longitudeFieldName
  ) => {
    const imageBlob = formData.get(fieldName || "image");
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

  const [formData, setFormData] = useState({
    state_id: "",
    district_id: "",
    block_id: "",
    segment_no: "",
    location_a_name: "",
    location_a_lat: "",
    location_a_long: "",
    location_b_name: "",
    location_b_lat: "",
    location_b_long: "",
    damage1_location_name: "",
    damage1_start_lat: "",
    damage1_start_long: "",
    damage1_end_lat: "",
    damage1_end_long: "",
    damage1_reason: "",
    damage1_overhead_cable: "",
    damage1_cable_type: "",
    damage2_location_name: "",
    damage2_start_lat: "",
    damage2_start_long: "",
    damage2_end_lat: "",
    damage2_end_long: "",
    damage2_reason: "",
    damage2_overhead_cable: "",
    damage2_cable_type: "",
    damage3_location_name: "",
    damage3_start_lat: "",
    damage3_start_long: "",
    damage3_end_lat: "",
    damage3_end_long: "",
    damage3_reason: "",
    damage3_overhead_cable: "",
    damage3_cable_type: "",
    route_direction: "",
    cable_depth: "",
    road_surface: "",
    road_width: "",
    road_type: "",
    road_working_period: "",
    pit1_lat: "",
    pit1_long: "",
    landmark1: "",
    pit2_lat: "",
    pit2_long: "",
    landmark2: "",
    pit3_lat: "",
    pit3_long: "",
    landmark3: "",
    pit4_lat: "",
    pit4_long: "",
    landmark4: "",
    other_remarks: ""
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
    const requiredFields = [
      { field: "state_id", message: "State Name is required" },
      { field: "district_id", message: "District Name is required" },
      { field: "block_id", message: "Block Name is required" },
      { field: "segment_no", message: "Segment No is required" },
      { field: "location_a_name", message: "Location A Name is required" },
      { field: "location_a_lat", message: "Location A Latitude is required" },
      { field: "location_a_long", message: "Location A Longitude is required" },
      { field: "location_b_name", message: "Location B Name is required" },
      { field: "location_b_lat", message: "Location B Latitude is required" },
      { field: "location_b_long", message: "Location B Longitude is required" },
      { field: "route_direction", message: "Route Direction is required" },
      { field: "cable_depth", message: "Cable Depth is required" },
      { field: "road_surface", message: "Road Surface is required" },
      { field: "road_type", message: "Road Type is required" },
    ];

    for (const error of requiredFields) {
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
    if (!isValid) return;

    const formData = new FormData(e.target);
    const formDataObject = Object.fromEntries(formData.entries());

    // Convert images to Base64 before submitting
    const imagePromises = images.map((item) =>
      Promise.all(
        Object.entries(item).map(async ([key, value]) => {
          if (key === "imageName") return;

          if ((key.endsWith("_l2_file") || key.endsWith("_picture")) && value instanceof File) {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.readAsDataURL(value);
              reader.onload = function () {
                formDataObject[key] = reader.result;
                resolve();
              };
            });
          } else {
            formDataObject[key] = value;
          }
        })
      )
    );

    await Promise.all(imagePromises);

    if (isOnline) {
      try {
        const response = await api.post("/save-damage-fiber-detail", formDataObject);
        toast.success("Damage fiber details submitted successfully!");
        setImages([]);
        e.target.reset();
        await syncPendingDamageFiberData();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit damage fiber details.");
        await addDamageFiberData({
          ...formDataObject,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      await addDamageFiberData({
        ...formDataObject,
        timestamp: new Date().toISOString(),
      });
      toast.success("Damage fiber details saved offline. Will sync when online.");
      setImages([]);
      e.target.reset();
    }
  };

  // Generate segment numbers 1-100 for dropdown
  const segmentNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Damage Fiber Details</h2>
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

          {/* Segment No */}
          <select
            className="form-select"
            name="segment_no"
            onChange={handleChange}
          >
            <option value="">Select Segment No</option>
            {segmentNumbers.map((num) => (
              <option key={`segment_${num}`} value={num}>
                {num}
              </option>
            ))}
          </select>

          {/* Location A */}
          <input
            type="text"
            className="form-input"
            name="location_a_name"
            placeholder="Enter Location A Name"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Location A L2 File"
            openCameraLabel={"Upload Location A L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="location_a_l2_file"
            latitudeFieldName="location_a_lat"
            longitudeFieldName="location_a_long"
          />

          {/* Location B */}
          <input
            type="text"
            className="form-input"
            name="location_b_name"
            placeholder="Enter Location B Name"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Location B L2 File"
            openCameraLabel={"Upload Location B L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="location_b_l2_file"
            latitudeFieldName="location_b_lat"
            longitudeFieldName="location_b_long"
          />

          {/* Damage 1 Section */}
          <h3>Damage 1 Details</h3>
          <input
            type="text"
            className="form-input"
            name="damage1_location_name"
            placeholder="Damage 1 Location Name"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 1 Start L2 File"
            openCameraLabel={"Upload Damage 1 Start L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage1_start_l2_file"
            latitudeFieldName="damage1_start_lat"
            longitudeFieldName="damage1_start_long"
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 1 End L2 File"
            openCameraLabel={"Upload Damage 1 End L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage1_end_l2_file"
            latitudeFieldName="damage1_end_lat"
            longitudeFieldName="damage1_end_long"
          />

          <select
            className="form-select"
            name="damage1_reason"
            onChange={handleChange}
          >
            <option value="">Select Damage 1 Reason</option>
            <option value="Road contruction">Road construction</option>
            <option value="soil erosion">Soil erosion</option>
            <option value="Water Pipeline">Water Pipeline</option>
            <option value="Electric Cable">Electric Cable</option>
            <option value="Culvert">Culvert</option>
            <option value="Pit Digging">Pit Digging</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            name="damage1_overhead_cable"
            onChange={handleChange}
          >
            <option value="">Select Damage 1 Overhead Cable</option>
            <option value="no">No</option>
            <option value="4c">4c</option>
            <option value="6c">6c</option>
            <option value="12c">12c</option>
            <option value="24c">24c</option>
          </select>

          <input
            type="text"
            className="form-input"
            name="damage1_cable_type"
            placeholder="Damage 1 Cable Type"
            onChange={handleChange}
          />

          {/* Damage 2 Section */}
          <h3>Damage 2 Details</h3>
          <input
            type="text"
            className="form-input"
            name="damage2_location_name"
            placeholder="Damage 2 Location Name"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 2 Start L2 File"
            openCameraLabel={"Upload Damage 2 Start L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage2_start_l2_file"
            latitudeFieldName="damage2_start_lat"
            longitudeFieldName="damage2_start_long"
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 2 End L2 File"
            openCameraLabel={"Upload Damage 2 End L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage2_end_l2_file"
            latitudeFieldName="damage2_end_lat"
            longitudeFieldName="damage2_end_long"
          />

          <select
            className="form-select"
            name="damage2_reason"
            onChange={handleChange}
          >
            <option value="">Select Damage 2 Reason</option>
            <option value="Road contruction">Road construction</option>
            <option value="soil erosion">Soil erosion</option>
            <option value="Water Pipeline">Water Pipeline</option>
            <option value="Electric Cable">Electric Cable</option>
            <option value="Culvert">Culvert</option>
            <option value="Pit Digging">Pit Digging</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            name="damage2_overhead_cable"
            onChange={handleChange}
          >
            <option value="">Select Damage 2 Overhead Cable</option>
            <option value="no">No</option>
            <option value="4c">4c</option>
            <option value="6c">6c</option>
            <option value="12c">12c</option>
            <option value="24c">24c</option>
          </select>

          <input
            type="text"
            className="form-input"
            name="damage2_cable_type"
            placeholder="Damage 2 Cable Type"
            onChange={handleChange}
          />

          {/* Damage 3 Section */}
          <h3>Damage 3 Details</h3>
          <input
            type="text"
            className="form-input"
            name="damage3_location_name"
            placeholder="Damage 3 Location Name"
            onChange={handleChange}
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 3 Start L2 File"
            openCameraLabel={"Upload Damage 3 Start L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage3_start_l2_file"
            latitudeFieldName="damage3_start_lat"
            longitudeFieldName="damage3_start_long"
          />

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Damage 3 End L2 File"
            openCameraLabel={"Upload Damage 3 End L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="damage3_end_l2_file"
            latitudeFieldName="damage3_end_lat"
            longitudeFieldName="damage3_end_long"
          />

          <select
            className="form-select"
            name="damage3_reason"
            onChange={handleChange}
          >
            <option value="">Select Damage 3 Reason</option>
            <option value="Road contruction">Road construction</option>
            <option value="soil erosion">Soil erosion</option>
            <option value="Water Pipeline">Water Pipeline</option>
            <option value="Electric Cable">Electric Cable</option>
            <option value="Culvert">Culvert</option>
            <option value="Pit Digging">Pit Digging</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            name="damage3_overhead_cable"
            onChange={handleChange}
          >
            <option value="">Select Damage 3 Overhead Cable</option>
            <option value="no">No</option>
            <option value="4c">4c</option>
            <option value="6c">6c</option>
            <option value="12c">12c</option>
            <option value="24c">24c</option>
          </select>

          <input
            type="text"
            className="form-input"
            name="damage3_cable_type"
            placeholder="Damage 3 Cable Type"
            onChange={handleChange}
          />

          {/* Route Direction */}
          <input
            type="text"
            className="form-input"
            name="route_direction"
            placeholder="Route Direction (e.g., RHS)"
            onChange={handleChange}
          />

          {/* Cable Health */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Cable Health Picture"
            openCameraLabel={"Upload Cable Health Picture"}
            captureImageLabel={"Capture Picture"}
            useImageLabel={"Use Picture"}
            removeImageLabel={"Remove Picture"}
            reUploadLabel={"Upload New Picture"}
            fieldName="cable_health_picture"
          />

          {/* Cable Depth */}
          <select
            className="form-select"
            name="cable_depth"
            onChange={handleChange}
          >
            <option value="">Select Cable Depth</option>
            <option value="0.25CM">0.25CM</option>
            <option value="0.50CM">0.50CM</option>
            <option value="0.75CM">0.75CM</option>
            <option value="1M">1M</option>
            <option value="1.25M">1.25M</option>
            <option value="1.50M">1.50M</option>
            <option value="1.75M">1.75M</option>
            <option value="ABOVE">ABOVE</option>
          </select>

          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Cable Depth Picture"
            openCameraLabel={"Upload Cable Depth Picture"}
            captureImageLabel={"Capture Picture"}
            useImageLabel={"Use Picture"}
            removeImageLabel={"Remove Picture"}
            reUploadLabel={"Upload New Picture"}
            fieldName="cable_depth_picture"
          />

          {/* Road Surface */}
          <select
            className="form-select"
            name="road_surface"
            onChange={handleChange}
          >
            <option value="">Select Road Surface</option>
            <option value="Bitumen">Bitumen</option>
            <option value="C.C.">C.C.</option>
            <option value="Kachcha">Kachcha</option>
            <option value="Bricks">Bricks</option>
          </select>

          {/* Road Width */}
          <input
            type="text"
            className="form-input"
            name="road_width"
            placeholder="Road Width"
            onChange={handleChange}
          />

          {/* Road Type */}
          <select
            className="form-select"
            name="road_type"
            onChange={handleChange}
          >
            <option value="">Select Road Type</option>
            <option value="NHAI">NHAI</option>
            <option value="State Highway">State Highway</option>
            <option value="Forest">Forest</option>
            <option value="Village Road">Village Road</option>
            <option value="other">Other</option>
          </select>

          {/* Road Working Period */}
          <select
            className="form-select"
            name="road_working_period"
            onChange={handleChange}
          >
            <option value="">Select Road Working Period</option>
            <option value="Jan">January</option>
            <option value="Feb">February</option>
            <option value="Mar">March</option>
            <option value="Apr">April</option>
            <option value="May">May</option>
            <option value="Jun">June</option>
            <option value="Jul">July</option>
            <option value="Aug">August</option>
            <option value="Sep">September</option>
            <option value="Oct">October</option>
            <option value="Nov">November</option>
            <option value="Dec">December</option>
          </select>

          {/* PIT 1 */}
          <h3>PIT 1 Details</h3>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="PIT 1 L2 File"
            openCameraLabel={"Upload PIT 1 L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="pit1_l2_file"
            latitudeFieldName="pit1_lat"
            longitudeFieldName="pit1_long"
          />

          <select
            className="form-select"
            name="landmark1"
            onChange={handleChange}
          >
            <option value="">Select Landmark 1</option>
            <option value="Culvert">Culvert</option>
            <option value="Railway crossing">Railway crossing</option>
            <option value="BSNL RI">BSNL RI</option>
            <option value="BSNL Manhole">BSNL Manhole</option>
            <option value="CRM">CRM</option>
          </select>

          {/* PIT 2 */}
          <h3>PIT 2 Details</h3>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="PIT 2 L2 File"
            openCameraLabel={"Upload PIT 2 L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="pit2_l2_file"
            latitudeFieldName="pit2_lat"
            longitudeFieldName="pit2_long"
          />

          <select
            className="form-select"
            name="landmark2"
            onChange={handleChange}
          >
            <option value="">Select Landmark 2</option>
            <option value="Culvert">Culvert</option>
            <option value="Railway crossing">Railway crossing</option>
            <option value="BSNL RI">BSNL RI</option>
            <option value="BSNL Manhole">BSNL Manhole</option>
            <option value="CRM">CRM</option>
          </select>

          {/* PIT 3 */}
          <h3>PIT 3 Details</h3>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="PIT 3 L2 File"
            openCameraLabel={"Upload PIT 3 L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="pit3_l2_file"
            latitudeFieldName="pit3_lat"
            longitudeFieldName="pit3_long"
          />

          <select
            className="form-select"
            name="landmark3"
            onChange={handleChange}
          >
            <option value="">Select Landmark 3</option>
            <option value="Culvert">Culvert</option>
            <option value="Railway crossing">Railway crossing</option>
            <option value="BSNL RI">BSNL RI</option>
            <option value="BSNL Manhole">BSNL Manhole</option>
            <option value="CRM">CRM</option>
          </select>

          {/* PIT 4 */}
          <h3>PIT 4 Details</h3>
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="PIT 4 L2 File"
            openCameraLabel={"Upload PIT 4 L2 File"}
            captureImageLabel={"Capture L2 File"}
            useImageLabel={"Use L2 File"}
            removeImageLabel={"Remove L2 File"}
            reUploadLabel={"Upload New L2 File"}
            fieldName="pit4_l2_file"
            latitudeFieldName="pit4_lat"
            longitudeFieldName="pit4_long"
          />

          <select
            className="form-select"
            name="landmark4"
            onChange={handleChange}
          >
            <option value="">Select Landmark 4</option>
            <option value="Culvert">Culvert</option>
            <option value="Railway crossing">Railway crossing</option>
            <option value="BSNL RI">BSNL RI</option>
            <option value="BSNL Manhole">BSNL Manhole</option>
            <option value="CRM">CRM</option>
          </select>

          {/* Other Remarks */}
          <textarea
            className="form-textarea"
            name="other_remarks"
            placeholder="Other Remarks"
            onChange={handleChange}
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

export default DamageFiberDetail;