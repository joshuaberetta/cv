import React from 'react';
import { Basics, WorkExperience, Education, Training, Deployment } from '../types/cv';

interface MainContentProps {
  basics: Basics;
  work: WorkExperience[];
  education: Education[];
  trainings?: Training[];
  deployments?: Deployment[];
}

const MainContent: React.FC<MainContentProps> = ({ basics, work, education, trainings, deployments }) => {
  return (
    <div className="main-content">
      <h1>{basics.name}</h1>
      <p className="tagline">{basics.tagline}</p>
      {basics.summary && <p className="summary">{basics.summary}</p>}
      
      <div className="section">
        <h2>Work Experience</h2>
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

      <div className="section">
        <h2>Education</h2>
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

      {deployments && deployments.length > 0 && (
        <div className="section">
          <h2>Humanitarian Deployments</h2>
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
      )}

      {trainings && trainings.length > 0 && (
        <div className="section">
          <h2>Trainings and Workshops</h2>
          <ul className="trainings-list">
            {trainings.map((training, index) => (
              <li key={index}>
                {training.event}, {training.year}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MainContent;
