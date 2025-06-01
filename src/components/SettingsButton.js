import React from 'react';

const SettingsButton = ({ onClick }) => {
  return (
    <button className="footer-btn" onClick={onClick}>
      <i className="fas fa-user"></i>
    </button>
  );
};

export default SettingsButton;