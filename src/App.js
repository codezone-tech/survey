import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import Login from './components/Login';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activePage, setActivePage] = useState('home');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    console.log('Checking PWA installability...');

    // Load Dark Mode preference
    const darkMode = localStorage.getItem('darkMode') === 'enabled';
    setIsDarkMode(darkMode);
    document.body.classList.toggle('dark-mode', darkMode);

    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setShowSplash(false);
    } else {
      setTimeout(() => setShowSplash(false), 2000);
    }

    // Detect Install Prompt (Android only)
    const handleBeforeInstallPrompt = (event) => {
      console.log('✅ beforeinstallprompt event fired');
      event.preventDefault();
      setInstallPrompt(event);
      setShowInstallPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detect if the device is a mobile or tablet
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipod|android|windows phone|blackberry|bb10|mini|windows ce|palm|webos|opera mini|mobi|tablet/i.test(userAgent);
      setIsMobileOrTablet(isMobile);
    };

    checkDevice();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const darkMode = !isDarkMode;
    setIsDarkMode(darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult) => {
        console.log(choiceResult.outcome === 'accepted' ? '🎉 Installed' : '❌ Dismissed');
        setInstallPrompt(null);
        setShowInstallPopup(false);
      });
    }
  };

  const handlePageChange = (page) => {
    setIsSidebarOpen(false);
    setActivePage(page);
  };

  /*if (!isMobileOrTablet) {
    return (
      <div className="unsupported-device">
        <h1>Unsupported Device</h1>
        <p>This application is only supported on mobile and tablet devices.</p>
      </div>
    );
  }*/

  return (
    <div className="App">
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : !isLoggedIn ? (
        <Login onLoginSuccess={(token) => {
          localStorage.setItem('token', token);
          setIsLoggedIn(true);
          navigate('/');
        }} />
      ) : (
        <>
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            toggleDarkMode={toggleDarkMode}
            isSidebarOpen={isSidebarOpen}  // Pass isSidebarOpen here
            isDarkMode={isDarkMode}
            isOnline={isOnline}
          />
          <Sidebar
            onPageChange={handlePageChange}
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onLogout={() => {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              navigate('/login', { replace: true });
            }}
          />
          <Content activePage={activePage} isOnline={isOnline} />
          <Footer onPageChange={handlePageChange} isOnline={isOnline} /> 

          {/* Install Popup (Manual & Automatic) */}
          {showInstallPopup && (
            <div className="ios-popup">
              <div className="ios-popup-content">
                <p>📲 Install this app on your home screen for quick access.</p>
                {installPrompt ? (
                  <div className="ios-popup-buttons">
                    <button className="ios-btn install" onClick={handleInstallClick}>Install</button>
                    <button className="ios-btn cancel" onClick={() => setShowInstallPopup(false)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <p>Follow these steps:</p>
                    <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                      {navigator.userAgent.includes('iPhone') ? (
                        <li>1. Tap <strong>Share</strong> (📤) in Safari.</li>
                      ) : (
                        <li>1. Tap <strong>Menu</strong> (⋮) in Chrome.</li>
                      )}
                      <li>2. Select <strong>"Add to Home Screen"</strong>.</li>
                      <li>3. Tap <strong>Add</strong> to confirm.</li>
                    </ul>
                    <div className="ios-popup-buttons">
                      <button className="ios-btn cancel" onClick={() => setShowInstallPopup(false)}>Cancel</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Offline Notification */}
          {!isOnline && (
            <div className="ios-popup">
              <div className="ios-popup-content">
                <p>⚠️ You are offline. Some features may not work.</p>
                <div className="ios-popup-buttons">
                  <button className="ios-btn ok" onClick={() => setIsOnline(true)}>OK</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;