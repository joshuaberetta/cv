import React from 'react';
import { Basics } from '../../../types/cv';

interface CVHeaderProps {
  basics: Basics;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const CVHeader: React.FC<CVHeaderProps> = ({ basics, onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="cv-header">
      <div className="header-left">
        {basics.photo && (
          <img 
            src={basics.photo} 
            alt={basics.name} 
            className="header-photo" 
          />
        )}
        <div className="header-text">
          <h1>{basics.name}</h1>
          <p className="tagline">{basics.tagline}</p>
        </div>
      </div>
      
      <button 
        className={`header-contact-btn ${isSidebarOpen ? 'active' : ''}`}
        onClick={onToggleSidebar}
      >
        Contact
      </button>
    </header>
  );
};

export default CVHeader;
