import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Sidebar = ({ onPageChange, isOpen, toggleSidebar, onLogout }) => {
  const [userData, setUserData] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedData = localStorage.getItem("loged_user_data");
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setUserData({
          name: parsedData.name || "User Name",
          email: parsedData.email || "user@example.com",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const confirmLogout = () => {
    toast.info(
      <div className="fancy-toast-content">
        <span className="fancy-toast-text">Are you sure you want to log out?</span>
        <div className="fancy-toast-buttons">
          <button
            className="fancy-toast-confirm"
            onClick={() => {
              toast.dismiss(); // Dismiss the confirmation toast
              handleLogout();
            }}
          >
            Yes
          </button>
          <button
            className="fancy-toast-cancel"
            onClick={() => toast.dismiss()} // Dismiss the confirmation toast
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false, // Disable auto-close for this toast
        closeButton: false, // Hide the default close button
        closeOnClick: false, // Prevent closing on click outside
        draggable: false,
        className: "fancy-toast",
      }
    );
  };

  const handleLogout = () => {
    toast.success(
      <div className="fancy-toast-content">
        {/* <i className="fas fa-check-circle fancy-toast-icon"></i> */}
        <span className="fancy-toast-text">Logged out successfully!</span>
      </div>,
      {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeButton: false,
        className: "fancy-toast",
      }
    );

    setTimeout(() => {
      onLogout(); // Perform actual logout
    }, 1500);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "active" : ""}`} id="sidebar">
        <div className="profile">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Profile" />
          <div className="info">
            <p>
              <strong>{userData.name}</strong>
            </p>
            <p>{userData.email}</p>
          </div>
        </div>
        <ul>
         
          <li onClick={() => onPageChange("GPMasterDetail")}>
            <i className="fas fa-globe"></i> GP Master Details
          </li>

          <li onClick={() => onPageChange("OLTMasterDetail")}>
            <i className="fas fa-globe"></i> OLT Master Details
          </li>

          <li onClick={() => onPageChange("ExistingFiberDetail")}>
            <i className="fas fa-book"></i> Existing Fiber Details
          </li>

          <li onClick={() => onPageChange("DamageFiberDetail")}>
            <i className="fas fa-book"></i> Damage Fiber Details
          </li>
         
          <li onClick={() => onPageChange("PlanningScreenDetail")}>
            <i className="fas fa-book"></i> Planning Screen Details
          </li>
          
          <li onClick={() => onPageChange("settings")}>
            <i className="fas fa-user"></i> Profile
          </li>

          <li onClick={() => onPageChange("settings")}>
            <i className="fas fa-cog"></i> Settings
          </li>
          
          <li className="logout" onClick={confirmLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </li>
        </ul>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={false}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        className="fancy-toast-container"
      />
    </>
  );
};

export default Sidebar;