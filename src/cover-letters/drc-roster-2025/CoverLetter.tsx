import React from 'react';
import { CVData } from '../../types/cv';
import Sidebar from '../../templates/default/web/Sidebar';
import '../../templates/default/web/main.css';
import content from './content.json';

interface CoverLetterProps {
  data: CVData;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ data }) => {
  const handlePrint = () => {
    window.open(`/Joshua Beretta - Cover Letter - DRC Roster 2025.pdf?t=${Date.now()}`, '_blank');
  };

  return (
    <div className="app">
      <div className="no-print print-controls">
        <button onClick={handlePrint} className="print-button">
          Download PDF
        </button>
      </div>
      
      <div className="cv-container">
        <Sidebar 
          basics={data.basics} 
          languages={data.languages} 
        />
        <div className="main-content">
          <header className="cv-header">
            <h1>{data.basics.name}</h1>
            <div className="tagline">{data.basics.tagline}</div>
          </header>

          <div className="cover-letter-body" style={{ marginTop: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
            <p style={{ marginBottom: '1rem' }}><strong>Date:</strong> {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style={{ marginBottom: '2rem' }}><strong>{content.subject}</strong></p>

            <p style={{ marginBottom: '1rem' }}>Dear {content.recipient},</p>

            {content.paragraphs.map((paragraph, index) => (
              <p key={index} style={{ marginBottom: '1rem' }}>
                {paragraph}
              </p>
            ))}

            <p style={{ marginBottom: '1rem' }}>
              Thank you for your time and consideration.
            </p>

            <p style={{ marginBottom: '1rem' }}>
              Sincerely,
            </p>

            <p>
              <strong>{data.basics.name}</strong>
            </p>
          </div>
        </div>
      </div>
      <div className="print-footer">
        {data.basics.name} - Cover Letter
      </div>
    </div>
  );
};

export default CoverLetter;
