import React from 'react';

const HomeButton = ({ onClick }) => {
  return (
    <button className="footer-btn" onClick={onClick}>
      <i className="fas fa-home"></i>
    </button>
  );
};

export default HomeButton;