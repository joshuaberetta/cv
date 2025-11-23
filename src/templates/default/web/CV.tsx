import React, { useState } from 'react';
import { CVData } from '../../../types/cv';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import CVHeader from './CVHeader';
import './main.css';

interface CVProps {
  data: CVData;
}

const CV: React.FC<CVProps> = ({ data }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="cv-container">
      <Sidebar 
        basics={data.basics} 
        languages={data.languages} 
        isOpen={isSidebarOpen}
      />
      <div className="content-wrapper">
        <CVHeader 
          basics={data.basics} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <MainContent 
          basics={data.basics} 
          sections={data.sections}
          work={data.work} 
          education={data.education} 
          trainings={data.trainings}
          deployments={data.deployments}
          volunteering={data.volunteering}
        />
      </div>
    </div>
  );
};

export default CV;
