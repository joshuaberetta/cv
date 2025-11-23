import React from 'react';
import { CVData } from '../types/cv';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface CVProps {
  data: CVData;
}

const CV: React.FC<CVProps> = ({ data }) => {
  return (
    <div className="cv-container">
      <Sidebar 
        basics={data.basics} 
        languages={data.languages} 
      />
      <MainContent 
        basics={data.basics} 
        work={data.work} 
        education={data.education} 
        trainings={data.trainings}
        deployments={data.deployments}
        volunteering={data.volunteering}
      />
    </div>
  );
};

export default CV;
