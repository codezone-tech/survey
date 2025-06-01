import React from 'react';
import HomeButton from './HomeButton';
import SurveButton from './SurveButton';
import SettingsButton from './SettingsButton';

const Footer = ({ onPageChange, isOnline }) => {
  return (
    <div className="footer">
      <HomeButton onClick={() => onPageChange('home')} />
      <SurveButton onClick={() => onPageChange('settings')} />
      <SettingsButton onClick={() => onPageChange('settings')} />
    </div>
  );
};

export default Footer;