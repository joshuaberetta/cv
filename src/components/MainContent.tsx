import React from 'react';
import { Basics, WorkExperience, Education, Training, Deployment, Volunteer, SectionTitles } from '../types/cv';

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
                  {job.company} ({job.location})
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
                  )} ({edu.location})
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
                  {deployment.organization} ({deployment.location})
                </div>
                {deployment.description && <p>{deployment.description}</p>}
              </div>
            ))}
          </div>
        );
      case 'trainings':
        if (!trainings || trainings.length === 0) return null;
        return (
          <div className="section" key={key}>
            <h2>{sections.trainings}</h2>
            <ul className="trainings-list">
              {trainings.map((training, index) => (
                <li key={index}>
                  {training.event}, {training.year}
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="main-content">
      <h1>{basics.name}</h1>
      <p className="tagline">{basics.tagline}</p>
      {basics.summary && <p className="summary">{basics.summary}</p>}
      
      {Object.keys(sections).map(key => renderSection(key))}
    </div>
  );
};

export default MainContent;
