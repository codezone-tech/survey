import React from 'react';
import HomePage from './HomePage';
import ExistingFiberDetail from './ExistingFiberDetail';
import SettingsPage from './SettingsPage';
import GPMasterDetail from './GPMasterDetail';
import OLTMasterDetail from './OLTMasterDetail';
import DamageFiberDetail from './DamageFiberDetail';
import PlanningScreenDetail from './PlanningScreenDetail';
// import GPMasterDetailMultiStep from './GPMasterDetailMultiStep';

const Content = ({ activePage, isOnline }) => {
  let pageComponent;

  switch (activePage) {
    case 'OLTMasterDetail':
      pageComponent = <OLTMasterDetail />;
      break;
    case 'DamageFiberDetail':
      pageComponent = <DamageFiberDetail />;
      break;
    case 'GPMasterDetail':
      pageComponent = <GPMasterDetail />;
      break;
    case 'ExistingFiberDetail':
      pageComponent = <ExistingFiberDetail />;
      break;
    case 'PlanningScreenDetail':
      pageComponent = <PlanningScreenDetail />;
      break;
    case 'home':
      pageComponent = <HomePage />;
      break;
    case 'settings':
      pageComponent = <SettingsPage />;
      break;
    default:
      pageComponent = <HomePage />;
  }

  return (
    <div className="container">
      {pageComponent}
    </div>
  );
};

export default Content;
