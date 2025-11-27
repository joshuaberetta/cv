import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getTemplateComponent } from '../templates/registry';
import { CVData } from '../types/cv';
import { PDF_FILENAME } from '../cv-meta';
import CoverLetter from '../cover-letters/drc-roster-2025/CoverLetter';
import GlobePage from '../pages/GlobePage';
import ContentDetailPage from '../pages/ContentDetailPage';
import { Content, ProjectContent, TrainingContent, WorkContent } from '../types/content';
import matter from 'gray-matter';

// Import all markdown files
const projectModules = import.meta.glob('../content/projects/*.md', { 
  eager: true,
  as: 'raw'
});

const trainingModules = import.meta.glob('../content/trainings/*.md', { 
  eager: true,
  as: 'raw'
});

const workModules = import.meta.glob('../content/work/*.md', { 
  eager: true,
  as: 'raw'
});

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
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadContent = () => {
      try {
        const projectsData: ProjectContent[] = [];
        const trainingsData: TrainingContent[] = [];
        const workData: WorkContent[] = [];
        
        // Load projects
        for (const [path, content] of Object.entries(projectModules)) {
          const result = matter(content as string);
          const frontmatter = result.data as any;
          
          const projectContent: ProjectContent = {
            slug: frontmatter.slug,
            section: 'projects',
            name: frontmatter.name,
            body: result.content.trim(),
            url: frontmatter.url,
            tags: frontmatter.tags || [],
            description: frontmatter.description,
            featured: frontmatter.featured || false,
            image: frontmatter.image,
            order: frontmatter.order || 999
          };
          projectsData.push(projectContent);
        }
        
        // Load trainings
        for (const [path, content] of Object.entries(trainingModules)) {
          const result = matter(content as string);
          const frontmatter = result.data as any;
          
          const trainingContent: TrainingContent = {
            slug: frontmatter.slug,
            section: 'trainings',
            name: frontmatter.course || frontmatter.name,
            body: result.content.trim(),
            organization: frontmatter.organization,
            course: frontmatter.course,
            location: frontmatter.location,
            country: frontmatter.country,
            year: frontmatter.year,
            language: frontmatter.language,
            order: frontmatter.order || 999
          };
          trainingsData.push(trainingContent);
        }
        
        // Load work
        for (const [path, content] of Object.entries(workModules)) {
          const result = matter(content as string);
          const frontmatter = result.data as any;
          
          const workContent: WorkContent = {
            slug: frontmatter.slug,
            section: 'work',
            name: frontmatter.position || frontmatter.name,
            body: result.content.trim(),
            position: frontmatter.position,
            company: frontmatter.company,
            location: frontmatter.location,
            startDate: frontmatter.startDate,
            endDate: frontmatter.endDate,
            order: frontmatter.order || 999
          };
          workData.push(workContent);
        }
        
        // Sort by order
        projectsData.sort((a, b) => (a.order || 999) - (b.order || 999));
        trainingsData.sort((a, b) => (a.order || 999) - (b.order || 999));
        workData.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        // Combine all content
        setAllContent([...projectsData, ...trainingsData, ...workData]);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<CVPage data={data} />} />
      <Route 
        path="/globe" 
        element={
          <GlobePage 
            basics={data.basics} 
            work={data.work}
            trainings={data.trainings}
            projects={allContent.filter(c => c.section === 'projects') as ProjectContent[]}
            trainingsContent={allContent.filter(c => c.section === 'trainings') as TrainingContent[]}
            workContent={allContent.filter(c => c.section === 'work') as WorkContent[]}
          />
        } 
      />
      <Route 
        path="/:section/:slug" 
        element={<ContentDetailPage allContent={allContent} />} 
      />
      <Route path="/cover-letters/drc-roster-2025" element={<CoverLetter data={data} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
