import React from 'react';
import CV from './CV';
import { CVData } from '../types/cv';
import { PDF_FILENAME } from '../cv-meta';

interface AppProps {
  data: CVData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const handlePrint = () => {
    // Open the pre-generated PDF with cache busting to ensure latest version
    // Use the filename from metadata which includes the date
    window.open(`${PDF_FILENAME}?t=${Date.now()}`, '_blank');
  };

  return (
    <div className="app">
      <div className="no-print print-controls">
        <button onClick={handlePrint} className="print-button">
          Download PDF
        </button>
      </div>
      <CV data={data} />
      <div className="print-footer">
        {data.basics.name} - CV
      </div>
    </div>
  );
};

export default App;
