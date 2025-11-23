import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { getTemplateComponent } from '../templates/registry';
import { CVData } from '../types/cv';
import { PDF_FILENAME } from '../cv-meta';
import CoverLetter from '../cover-letters/drc-roster-2025/CoverLetter';

interface AppProps {
  data: CVData;
}

const CVPage: React.FC<AppProps> = ({ data }) => {
  const handlePrint = () => {
    // Open the pre-generated PDF with cache busting to ensure latest version
    // Use the filename from metadata which includes the date
    window.open(`${PDF_FILENAME}?t=${Date.now()}`, '_blank');
  };

  const CVComponent = getTemplateComponent(data.basics.template);

  return (
    <div className="app">
      <div className="no-print print-controls">
        <button onClick={handlePrint} className="print-button">
          Download PDF
        </button>
      </div>
      <CVComponent data={data} />
      <div className="print-footer">
        {data.basics.name} - CV
      </div>
    </div>
  );
};

const App: React.FC<AppProps> = ({ data }) => {
  return (
    <Routes>
      <Route path="/" element={<CVPage data={data} />} />
      <Route path="/cover-letters/drc-roster-2025" element={<CoverLetter data={data} />} />
    </Routes>
  );
};

export default App;
