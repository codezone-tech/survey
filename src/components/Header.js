import React from 'react';

const Header = ({ toggleSidebar, toggleDarkMode, isSidebarOpen, isDarkMode, isOnline }) => {
  return (
    <div className="header">
      <i 
        className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'} menu-btn`} 
        onClick={toggleSidebar}
      ></i>
      <span>GIS Survey</span>
      {/* <i 
        className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} dark-mode-toggle`} 
        onClick={toggleDarkMode}
      ></i> */}
      <i></i>
    </div>
  );
};

export default Header;
