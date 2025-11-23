import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import yaml from 'js-yaml';
import App from './components/App';
import { CVData } from './types/cv';

// Fetch CV data
const fetchCVData = async (): Promise<CVData> => {
  try {
    // Try to fetch JSON file first
    const response = await fetch('/data/cv-data.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load JSON data:', error);
  }
  
  try {
    // Fallback to YAML if JSON is not available
    const yamlResponse = await fetch('/data/cv-data.yaml');
    if (yamlResponse.ok) {
      const yamlText = await yamlResponse.text();
      const parsedData = yaml.load(yamlText) as CVData;
      console.log('Loaded YAML data');
      return parsedData;
    }
  } catch (error) {
    console.error('Failed to load YAML data:', error);
  }
  
  // Fallback to default data if both fail
  console.warn('Using default CV data as fallback');
  return defaultData;
};

// Default CV data as fallback
const defaultData: CVData = {
  basics: {
    name: "Example Name",
    tagline: "Your professional tagline",
    location: "Your Location",
    email: "example@example.com",
    phone: "+1234567890",
    website: "example.com",
    birthdate: "01/01/1990",
    nationality: "Your Nationality"
  },
  sections: {
    work: "Work Experience",
    education: "Education",
    volunteering: "Volunteering",
    deployments: "Humanitarian Deployments",
    trainings: "Trainings and Workshops"
  },
  languages: [
    {
      language: "English",
      fluency: "Native"
    }
  ],
  work: [
    {
      position: "Job Title",
      company: "Company Name",
      location: "Location",
      startDate: "01/2020",
      endDate: "Present"
    }
  ],
  education: [
    {
      degree: "Degree Name",
      institution: "Institution Name",
      location: "Location",
      website: "https://example.edu",
      startDate: "01/2015",
      endDate: "12/2019",
      level: "Level"
    }
  ]
};

// Initialize the app
const initApp = async () => {
  try {
    const cvData = await fetchCVData();
    const rootElement = document.getElementById('root');
    
    if (rootElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <App data={cvData} />
          </BrowserRouter>
        </React.StrictMode>
      );
    } else {
      console.error('Root element not found');
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};

// Start the app
initApp();
