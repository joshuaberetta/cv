import React from 'react';
import CV from './CV';
import { CVData } from '../types/cv';

interface AppProps {
  data: CVData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const handlePrint = () => {
    // Open the pre-generated PDF
    window.open('cv.pdf', '_blank');
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
