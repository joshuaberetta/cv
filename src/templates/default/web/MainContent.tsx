import React from 'react';
import { Basics, WorkExperience, Education, Training, Deployment, Volunteer, SectionTitles } from '../../../types/cv';

interface MainContentProps {
  basics: Basics;
  sections: SectionTitles;
  work: WorkExperience[];
  education: Education[];
  trainings?: Training[];
  deployments?: Deployment[];
  volunteering?: Volunteer[];
}

const MainContent: React.FC<MainContentProps> = ({ basics, sections, work, education, trainings, deployments, volunteering }) => {
  const renderSection = (key: string) => {
    switch (key) {
      case 'work':
        return (
          <div className="section" key={key}>
            <h2>{sections.work}</h2>
            {work.map((job, index) => (
              <div className="experience-item" key={index}>
                <div className="item-header">
                  <div className="item-title">{job.position}</div>
                  <div className="item-date">{job.startDate} – {job.endDate}</div>
                </div>
                <div className="item-subtitle">
                  {job.company}
                  {job.location && <span className="location">, {job.location}</span>}
                </div>
                {job.description && <p>{job.description}</p>}
              </div>
            ))}
          </div>
        );
      case 'education':
        return (
          <div className="section" key={key}>
            <h2>{sections.education}</h2>
            {education.map((edu, index) => (
              <div className="education-item" key={index}>
                <div className="item-header">
                  <div className="item-title">{edu.degree}</div>
                  <div className="item-date">{edu.startDate} – {edu.endDate}</div>
                </div>
                <div className="item-subtitle">
                  {edu.website ? (
                    <a href={edu.website} target="_blank" rel="noopener noreferrer">
                      {edu.institution}
                    </a>
                  ) : (
                    edu.institution
                  )}
                  {edu.location && <span className="location">, {edu.location}</span>}
                </div>
                <div>Level in EQF: {edu.level}</div>
                {edu.description && <p>{edu.description}</p>}
              </div>
            ))}
          </div>
        );
      case 'volunteering':
        if (!volunteering || volunteering.length === 0) return null;
        return (
          <div className="section" key={key}>
            <h2>{sections.volunteering}</h2>
            {volunteering.map((vol, index) => (
              <div className="experience-item" key={index}>
                <div className="item-header">
                  <div className="item-title">{vol.position}</div>
                  <div className="item-date">{vol.startDate} – {vol.endDate}</div>
                </div>
                <div className="item-subtitle">
                  {vol.organization}
                </div>
                {vol.summary && <p>{vol.summary}</p>}
              </div>
            ))}
          </div>
        );
      case 'deployments':
        if (!deployments || deployments.length === 0) return null;
        return (
          <div className="section" key={key}>
            <h2>{sections.deployments}</h2>
            {deployments.map((deployment, index) => (
              <div className="experience-item" key={index}>
                <div className="item-header">
                  <div className="item-title">{deployment.position}</div>
                  <div className="item-date">{deployment.startDate} – {deployment.endDate}</div>
                </div>
                <div className="item-subtitle">
                  {deployment.organization}
                  {deployment.location && <span className="location">, {deployment.location}</span>}
                </div>
                {deployment.description && <p>{deployment.description}</p>}
              </div>
            ))}
          </div>
        );
      case 'trainings':
        if (!trainings || trainings.length === 0) return null;
        
        // Group trainings by year
        const trainingsByYear = trainings.reduce((acc, training) => {
          const year = training.year;
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(training);
          return acc;
        }, {} as Record<string, typeof trainings>);

        // Sort years descending
        const sortedYears = Object.keys(trainingsByYear).sort((a, b) => parseInt(b) - parseInt(a));

        return (
          <div className="section" key={key}>
            <h2>{sections.trainings}</h2>
            <div className="trainings-container">
              {sortedYears.map(year => (
                <div key={year} className="training-year-group">
                  <div className="year-label">{year}</div>
                  <ul className="trainings-list">
                    {trainingsByYear[year].map((training, index) => (
                      <li key={index}>
                        <div className="training-org">
                          <strong>{training.organization}</strong>
                          {training.location && <span className="location">, {training.location}</span>}
                        </div>
                        <div className="training-info">
                          <span className="course">{training.course}</span>
                          {training.language && <span className="language"> • {training.language}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      {basics.summary && <p className="summary">{basics.summary}</p>}
      
      {Object.keys(sections).map(key => renderSection(key))}
    </div>
  );
};

export default MainContent;
