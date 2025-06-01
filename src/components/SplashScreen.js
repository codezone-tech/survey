import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SplashScreen = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const slidesCount = 3; // Total number of slides
    let slideIndex = 0;

    const interval = setInterval(() => {
      slideIndex += 1;
      setCurrentSlide(slideIndex);

      if (slideIndex >= slidesCount - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSplash(false);
          onComplete();

          // Check token only AFTER splash is done
          const token = localStorage.getItem("token");
          if (token) {
            navigate("/");
          }
        }, 500); // Small delay for smooth transition
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [onComplete, navigate]);

  const closeSplashScreen = () => {
    setShowSplash(false);
    onComplete();
    
    // Navigate instantly if logged in
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  };

  if (!showSplash) return null; // Hide splash screen after it's done

  return (
    <div className="splash-screen">
      <div className="slides">
        <div className="slide" style={{ transform: `translateX(-${currentSlide * 100}%)`, backgroundImage: "url('./images/splash_1.avif')" }}></div>
        <div className="slide" style={{ transform: `translateX(-${currentSlide * 100}%)`, backgroundImage: "url('./images/splash_1.avif')" }}></div>
        <div className="slide" style={{ transform: `translateX(-${currentSlide * 100}%)`, backgroundImage: "url('./images/splash_1.avif')" }}></div>
      </div>
      <div className="skip-btn" onClick={closeSplashScreen}>
        Skip
      </div>
    </div>
  );
};

export default SplashScreen;
