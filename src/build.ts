import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './components/App';
import { CVData } from './types/cv';

// Function to load CV data from either YAML or JSON
const loadCVData = (): CVData => {
  try {
    // Try to load YAML first
    const yamlPath = path.resolve(process.cwd(), 'public/data/cv-data.yaml');
    if (fs.existsSync(yamlPath)) {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      return yaml.load(yamlContent) as CVData;
    }
    
    // Try JSON if YAML is not available
    const jsonPath = path.resolve(process.cwd(), 'public/data/cv-data.json');
    if (fs.existsSync(jsonPath)) {
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(jsonContent) as CVData;
    }
    
    throw new Error('No CV data file found');
  } catch (error) {
    console.error('Error loading CV data:', error);
    throw error;
  }
};

// Function to generate static HTML
const generateStaticHTML = (data: CVData): string => {
  // Create the CSS inline to make it a self-contained HTML file
  const cssPath = path.resolve(process.cwd(), 'src/styles/main.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Render React components to string
  const appHtml = renderToString(React.createElement(App, { data }));
  
  // Create full HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${data.basics.name}</title>
  <meta name="description" content="Professional CV for ${data.basics.name}">
  <style>${cssContent}</style>
</head>
<body>
  <div id="root">${appHtml}</div>
</body>
</html>`;
};

// Main build function
const build = () => {
  try {
    // Load CV data
    const cvData = loadCVData();
    
    // Generate HTML
    const html = generateStaticHTML(cvData);
    
    // Create dist directory if it doesn't exist
    const distDir = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Write HTML file
    fs.writeFileSync(path.resolve(distDir, 'index.html'), html);
    
    console.log('CV website built successfully! Output: dist/index.html');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

// Run the build
build();
