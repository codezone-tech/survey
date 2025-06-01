import React from 'react';

const SurveButton = ({ onClick }) => {
  return (
    <button className="footer-btn" onClick={onClick}>
      <i className="fas fa-book"></i>
    </button>
  );
};

export default SurveButton;