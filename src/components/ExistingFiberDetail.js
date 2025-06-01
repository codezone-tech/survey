import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CameraComponent from "./CameraComponent";
import api from "../utils/api";
import geoLocations from "../utils/geo_locations.json";
import { addExistingFiberData, syncPendingExistingFiberData, getAllExistingFiberData } from "../utils/idbHelper";

const ExistingFiberDetail = () => {
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
        console.log("geo_details_list errors: ", err);
      }
    };

    fetchGEOLocationDetails();
  }, []);

  useEffect(() => {
    if (isOnline) {
      const fetchAllSavedFiberData = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const savedFiberData = await getAllExistingFiberData();
        console.log('getSavedAllFiberData', savedFiberData);
        syncPendingExistingFiberData();
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

    if (!imageBlob) {
      console.error("Image Blob is undefined or null.");
      return;
    }

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
    location_a_l2_file: "",
    distance_from_a: "",
    location_b_name: "",
    location_b_lat: "",
    location_b_long: "",
    location_b_l2_file: "",
    zero_mh_gp_lat: "",
    zero_mh_gp_long: "",
    zero_mh_gp_l2_file: "",
    type_of_cable: "",
    cable_core: "",
    route_direction: "",
    road_surface: "",
    road_width: "",
    road_type: "",
    road_non_working_month_from: "",
    road_non_working_month_to: "",
    crm1_lat: "",
    crm1_long: "",
    crm1_l2_file: "",
    crm2_lat: "",
    crm2_long: "",
    crm2_l2_file: "",
    crm3_lat: "",
    crm3_long: "",
    crm3_l2_file: "",
    crm4_lat: "",
    crm4_long: "",
    crm4_l2_file: "",
    landmark1_type: "",
    landmark1_lat: "",
    landmark1_long: "",
    landmark1_l2_file: "",
    landmark2_type: "",
    landmark2_lat: "",
    landmark2_long: "",
    landmark2_l2_file: "",
    landmark3_type: "",
    landmark3_lat: "",
    landmark3_long: "",
    landmark3_l2_file: "",
    landmark4_type: "",
    landmark4_lat: "",
    landmark4_long: "",
    landmark4_l2_file: "",
    document_type_available: "",
    other_remarks: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "state_id") {
      setDistrictsList([]);
      setBlocksList([]);
      const districts_details_list = geoLocations.data
        .filter((item) => item.parent_id === value)
        .sort((a, b) => a.name.localeCompare(b.name));
      setDistrictsList(districts_details_list);
    }

    if (name === "district_id") {
      setBlocksList([]);
      const blocks_details_list = geoLocations.data
        .filter((item) => item.parent_id === value)
        .sort((a, b) => a.name.localeCompare(b.name));
      setBlocksList(blocks_details_list);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = async () => {
    const errors = [
      { field: "district_id", message: "District Name is required" },
      { field: "block_id", message: "Block Name is required" },
      { field: "segment_no", message: "Segment No is required" },
      { field: "location_a_name", message: "Location A Name is required" },
      { field: "location_b_name", message: "Location B Name is required" },
      { field: "type_of_cable", message: "Type of Cable is required" },
      { field: "cable_core", message: "Cable Core is required" },
      { field: "route_direction", message: "Route Direction is required" },
      { field: "road_surface", message: "Road Surface is required" },
      { field: "road_width", message: "Road Width is required" },
      { field: "road_type", message: "Road Type is required" },
    ];

    for (const error of errors) {
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

    const formDataObj = new FormData(e.target);
    const formDataObject = Object.fromEntries(formDataObj.entries());
    const district_id = formDataObj.get("district_id");
    const block_id = formDataObj.get("block_id");

    // Convert images to Base64
    const imagePromises = images.map((item) =>
      Promise.all(
        Object.entries(item).map(async ([key, value]) => {
          if (key === "imageName") return;

          if ((key.endsWith("_photo") || key.endsWith("_l2_file")) && value instanceof File) {
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
        const response = await api.post(
          `/existing-fiber-details/${district_id}/${block_id}`,
          formDataObject
        );
        toast.success("Fiber details submitted successfully!");
        setImages([]);
        e.target.reset();
        await syncPendingExistingFiberData();
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit fiber details.");
        await addExistingFiberData({
          ...formDataObject,
          district_id,
          block_id,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      await addExistingFiberData({
        ...formDataObject,
        district_id,
        block_id,
        timestamp: new Date().toISOString(),
      });
      toast.success("Fiber details saved offline. Will sync when online.");
      setImages([]);
      e.target.reset();
    }
  };

  // Generate segment numbers 1-100
  const segmentNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="survey-form-container">
      <h2 className="form-title">Existing Fiber Details</h2>
      <div className="survey-form-wrapper">
        <form className="survey-form" onSubmit={handleSubmit}>
          {/* State Name */}
          <select
            className="form-select"
            name="state_id"
            onChange={handleChange}
            value={formData.state_id}
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
            value={formData.district_id}
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
            value={formData.block_id}
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
            value={formData.segment_no}
          >
            <option value="">Select Segment No</option>
            {segmentNumbers.map((num) => (
              <option key={`segment_${num}`} value={num}>
                {num}
              </option>
            ))}
          </select>

          {/* Location A Name */}
          <input
            type="text"
            className="form-input"
            name="location_a_name"
            placeholder="Enter Location A Name"
            onChange={handleChange}
            value={formData.location_a_name}
          />

          {/* Location A Lat/Long */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Location A"
            openCameraLabel={"Capture Location A Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Location A Image"}
            fieldName="location_a_l2_file"
            latitudeFieldName="location_a_lat"
            longitudeFieldName="location_a_long"
          />

          {/* Distance From A */}
          <select
            className="form-select"
            name="distance_from_a"
            onChange={handleChange}
            value={formData.distance_from_a}
          >
            <option value="">Select Distance From A</option>
            <option value="OMTR">OMTR</option>
            <option value="500MTR">500MTR</option>
            <option value="1000MTR">1000MTR</option>
            <option value="1500MTR">1500MTR</option>
            <option value="2000MTR">2000MTR</option>
            <option value="2500MTR">2500MTR</option>
            <option value="3000MTR">3000MTR</option>
            <option value="3500MTR">3500MTR</option>
            <option value="4000MTR">4000MTR</option>
            <option value="4500MTR">4500MTR</option>
            <option value="5000MTR">5000MTR</option>
          </select>

          {/* Location B Name */}
          <input
            type="text"
            className="form-input"
            name="location_b_name"
            placeholder="Enter Location B Name"
            onChange={handleChange}
            value={formData.location_b_name}
          />

          {/* Location B Lat/Long */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Location B"
            openCameraLabel={"Capture Location B Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Location B Image"}
            fieldName="location_b_l2_file"
            latitudeFieldName="location_b_lat"
            longitudeFieldName="location_b_long"
          />

          {/* Zero MH GP */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="Zero MH GP"
            openCameraLabel={"Capture Zero MH GP Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New Zero MH GP Image"}
            fieldName="zero_mh_gp_l2_file"
            latitudeFieldName="zero_mh_gp_lat"
            longitudeFieldName="zero_mh_gp_long"
          />

          {/* Type of Cable */}
          <input
            type="text"
            className="form-input"
            name="type_of_cable"
            placeholder="Enter Type of Cable"
            onChange={handleChange}
            value={formData.type_of_cable}
          />

          {/* Cable Core */}
          <input
            type="text"
            className="form-input"
            name="cable_core"
            placeholder="Enter Cable Core"
            onChange={handleChange}
            value={formData.cable_core}
          />

          {/* Route Direction */}
          <select
            className="form-select"
            name="route_direction"
            onChange={handleChange}
            value={formData.route_direction}
          >
            <option value="">Select Route Direction</option>
            <option value="RHS">RHS</option>
            <option value="LHS">LHS</option>
          </select>

          {/* Road Surface */}
          <select
            className="form-select"
            name="road_surface"
            onChange={handleChange}
            value={formData.road_surface}
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
            placeholder="Enter Road Width"
            onChange={handleChange}
            value={formData.road_width}
          />

          {/* Road Type */}
          <select
            className="form-select"
            name="road_type"
            onChange={handleChange}
            value={formData.road_type}
          >
            <option value="">Select Road Type</option>
            <option value="NHAI">NHAI</option>
            <option value="State Highway">State Highway</option>
            <option value="Forest">Forest</option>
            <option value="Village Road">Village Road</option>
            <option value="Other">Other</option>
          </select>

          {/* Road Non-Working Months */}
          <div className="form-row">
            <select
              className="form-select"
              name="road_non_working_month_from"
              onChange={handleChange}
              value={formData.road_non_working_month_from}
            >
              <option value="">From Month</option>
              <option value="Jan">Jan</option>
              <option value="Feb">Feb</option>
              <option value="Mar">Mar</option>
              <option value="Apr">Apr</option>
              <option value="May">May</option>
              <option value="Jun">Jun</option>
              <option value="Jul">Jul</option>
              <option value="Aug">Aug</option>
              <option value="Sep">Sep</option>
              <option value="Oct">Oct</option>
              <option value="Nov">Nov</option>
              <option value="Dec">Dec</option>
            </select>

            <select
              className="form-select"
              name="road_non_working_month_to"
              onChange={handleChange}
              value={formData.road_non_working_month_to}
            >
              <option value="">To Month</option>
              <option value="Jan">Jan</option>
              <option value="Feb">Feb</option>
              <option value="Mar">Mar</option>
              <option value="Apr">Apr</option>
              <option value="May">May</option>
              <option value="Jun">Jun</option>
              <option value="Jul">Jul</option>
              <option value="Aug">Aug</option>
              <option value="Sep">Sep</option>
              <option value="Oct">Oct</option>
              <option value="Nov">Nov</option>
              <option value="Dec">Dec</option>
            </select>
          </div>

          {/* CRM Points */}
          <h3 className="form-section-title">CRM Points</h3>

          {/* CRM 1 */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CRM 1"
            openCameraLabel={"Capture CRM 1 Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CRM 1 Image"}
            fieldName="crm1_l2_file"
            latitudeFieldName="crm1_lat"
            longitudeFieldName="crm1_long"
          />

          {/* CRM 2 */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CRM 2"
            openCameraLabel={"Capture CRM 2 Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CRM 2 Image"}
            fieldName="crm2_l2_file"
            latitudeFieldName="crm2_lat"
            longitudeFieldName="crm2_long"
          />

          {/* CRM 3 */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CRM 3"
            openCameraLabel={"Capture CRM 3 Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CRM 3 Image"}
            fieldName="crm3_l2_file"
            latitudeFieldName="crm3_lat"
            longitudeFieldName="crm3_long"
          />

          {/* CRM 4 */}
          <CameraComponent
            onCapture={handleCapture}
            onRemove={handleRemove}
            imageName="CRM 4"
            openCameraLabel={"Capture CRM 4 Coordinates"}
            captureImageLabel={"Capture image"}
            useImageLabel={"Use image"}
            removeImageLabel={"Remove Image"}
            reUploadLabel={"Upload New CRM 4 Image"}
            fieldName="crm4_l2_file"
            latitudeFieldName="crm4_lat"
            longitudeFieldName="crm4_long"
          />

          {/* Landmarks */}
          <h3 className="form-section-title">Landmarks</h3>

          {/* Landmark 1 */}
          <div className="landmark-container">
            <select
              className="form-select"
              name="landmark1_type"
              onChange={handleChange}
              value={formData.landmark1_type}
            >
              <option value="">Select Landmark 1 Type</option>
              <option value="Culvert">Culvert</option>
              <option value="Railway crossing">Railway crossing</option>
              <option value="BSNL RI">BSNL RI</option>
              <option value="BSNL Manhole">BSNL Manhole</option>
            </select>

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="Landmark 1"
              openCameraLabel={"Capture Landmark 1 Coordinates"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New Landmark 1 Image"}
              fieldName="landmark1_l2_file"
              latitudeFieldName="landmark1_lat"
              longitudeFieldName="landmark1_long"
            />
          </div>

          {/* Landmark 2 */}
          <div className="landmark-container">
            <select
              className="form-select"
              name="landmark2_type"
              onChange={handleChange}
              value={formData.landmark2_type}
            >
              <option value="">Select Landmark 2 Type</option>
              <option value="Culvert">Culvert</option>
              <option value="Railway crossing">Railway crossing</option>
              <option value="BSNL RI">BSNL RI</option>
              <option value="BSNL Manhole">BSNL Manhole</option>
            </select>

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="Landmark 2"
              openCameraLabel={"Capture Landmark 2 Coordinates"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New Landmark 2 Image"}
              fieldName="landmark2_l2_file"
              latitudeFieldName="landmark2_lat"
              longitudeFieldName="landmark2_long"
            />
          </div>

          {/* Landmark 3 */}
          <div className="landmark-container">
            <select
              className="form-select"
              name="landmark3_type"
              onChange={handleChange}
              value={formData.landmark3_type}
            >
              <option value="">Select Landmark 3 Type</option>
              <option value="Culvert">Culvert</option>
              <option value="Railway crossing">Railway crossing</option>
              <option value="BSNL RI">BSNL RI</option>
              <option value="BSNL Manhole">BSNL Manhole</option>
            </select>

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="Landmark 3"
              openCameraLabel={"Capture Landmark 3 Coordinates"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New Landmark 3 Image"}
              fieldName="landmark3_l2_file"
              latitudeFieldName="landmark3_lat"
              longitudeFieldName="landmark3_long"
            />
          </div>

          {/* Landmark 4 */}
          <div className="landmark-container">
            <select
              className="form-select"
              name="landmark4_type"
              onChange={handleChange}
              value={formData.landmark4_type}
            >
              <option value="">Select Landmark 4 Type</option>
              <option value="Culvert">Culvert</option>
              <option value="Railway crossing">Railway crossing</option>
              <option value="BSNL RI">BSNL RI</option>
              <option value="BSNL Manhole">BSNL Manhole</option>
            </select>

            <CameraComponent
              onCapture={handleCapture}
              onRemove={handleRemove}
              imageName="Landmark 4"
              openCameraLabel={"Capture Landmark 4 Coordinates"}
              captureImageLabel={"Capture image"}
              useImageLabel={"Use image"}
              removeImageLabel={"Remove Image"}
              reUploadLabel={"Upload New Landmark 4 Image"}
              fieldName="landmark4_l2_file"
              latitudeFieldName="landmark4_lat"
              longitudeFieldName="landmark4_long"
            />
          </div>

          {/* Document Type Available */}
          <select
            className="form-select"
            name="document_type_available"
            onChange={handleChange}
            value={formData.document_type_available}
          >
            <option value="">Select Document Type Available</option>
            <option value="ABD">ABD</option>
            <option value="KML">KML</option>
            <option value="L-14">L-14</option>
            <option value=".Shp">.Shp</option>
            <option value="all">All</option>
          </select>

          {/* Other Remarks */}
          <textarea
            className="form-textarea"
            name="other_remarks"
            placeholder="Enter Other Remarks"
            onChange={handleChange}
            value={formData.other_remarks}
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

export default ExistingFiberDetail;