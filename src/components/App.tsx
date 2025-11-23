import React from 'react';
import CV from './CV';
import { CVData } from '../types/cv';

interface AppProps {
  data: CVData;
}

const App: React.FC<AppProps> = ({ data }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app">
      <div className="no-print print-controls">
        <button onClick={handlePrint} className="print-button">
          Print to PDF
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
