import React from 'react';
import QRCode from 'react-qr-code';
import { CVData } from '../types/cv';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

interface CVProps {
  data: CVData;
}

const CV: React.FC<CVProps> = ({ data }) => {
  return (
    <div className="cv-container">
      {data.basics.latestVersionUrl && (
        <div className="qr-code-container print-only">
          <div className="qr-code-wrapper">
            <QRCode 
              value={data.basics.latestVersionUrl} 
              size={64} 
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
            />
          </div>
          <a href={data.basics.latestVersionUrl} target="_blank" rel="noopener noreferrer" className="qr-link" style={{ textAlign: 'center' }}>
              Latest Version<br/>cv.joshuaberetta.com
            </a>
        </div>
      )}
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
      />
    </div>
  );
};

export default CV;
