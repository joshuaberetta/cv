import React from 'react';
import { CVData } from '../../../types/cv';
import './main.css';

interface CVProps {
  data: CVData;
}

const CV: React.FC<CVProps> = ({ data }) => {
  const { basics, work, education, skills, languages, sections } = data;

  return (
    <div className="pride-cv-container">
      <header className="pride-header">
        <h1>{basics.name}</h1>
        <div className="tagline">{basics.tagline}</div>
        <div className="pride-contact-info">
          {basics.email && (
            <div className="pride-contact-item">
              {Array.isArray(basics.email) ? (
                basics.email.map((email, index) => (
                  <React.Fragment key={email}>
                    {index > 0 && " / "}
                    <a href={`mailto:${email}`}>{email}</a>
                  </React.Fragment>
                ))
              ) : (
                <a href={`mailto:${basics.email}`}>{basics.email}</a>
              )}
            </div>
          )}
          {basics.phone && (
            <div className="pride-contact-item">
              <a href={basics.phoneUrl || `tel:${basics.phone}`}>{basics.phone}</a>
            </div>
          )}
          {basics.website && (
            <div className="pride-contact-item">
              <a href={basics.website} target="_blank" rel="noopener noreferrer">{basics.website}</a>
            </div>
          )}
          {basics.location && (
            <div className="pride-contact-item">
              {basics.location}
            </div>
          )}
        </div>
      </header>

      <main className="pride-main">
        <div className="left-column">
          {basics.summary && (
            <section className="pride-section">
              <h2 className="pride-section-title">About Me</h2>
              <p>{basics.summary}</p>
            </section>
          )}

          <section className="pride-section">
            <h2 className="pride-section-title">{sections.work}</h2>
            {work.map((job, index) => (
              <div key={index} className="pride-item">
                <div className="pride-item-header">
                  <span className="pride-item-title">{job.position}</span>
                  <span className="pride-item-date">{job.startDate} - {job.endDate}</span>
                </div>
                <div className="pride-item-subtitle">{job.company}, {job.location}</div>
                {job.description && <p>{job.description}</p>}
              </div>
            ))}
          </section>

          <section className="pride-section">
            <h2 className="pride-section-title">{sections.education}</h2>
            {education.map((edu, index) => (
              <div key={index} className="pride-item">
                <div className="pride-item-header">
                  <span className="pride-item-title">{edu.institution}</span>
                  <span className="pride-item-date">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="pride-item-subtitle">{edu.degree}</div>
                {edu.description && <p>{edu.description}</p>}
              </div>
            ))}
          </section>
        </div>

        <div className="right-column">
          {skills && skills.length > 0 && (
            <section className="pride-section">
              <h2 className="pride-section-title">Skills</h2>
              <div className="pride-skills-list">
                {skills.map((skill, index) => (
                  <span key={index} className="pride-skill-tag">{skill}</span>
                ))}
              </div>
            </section>
          )}

          {languages && languages.length > 0 && (
            <section className="pride-section">
              <h2 className="pride-section-title">Languages</h2>
              {languages.map((lang, index) => (
                <div key={index} className="pride-item">
                  <div className="pride-item-title">{lang.language}</div>
                  <div className="pride-item-subtitle">
                    {lang.fluency || (lang.skills && `Listening: ${lang.skills.listening} | Speaking: ${lang.skills.spokenInteraction}`)}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default CV;
