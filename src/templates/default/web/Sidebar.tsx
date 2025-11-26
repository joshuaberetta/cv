import React from 'react';
import { Basics, Language } from '../../../types/cv';
import SpinningGlobe from './SpinningGlobe';

interface SidebarProps {
  basics: Basics;
  languages: Language[];
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ basics, languages, isOpen = false }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <img 
        src={basics.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + encodeURIComponent(basics.name)} 
        alt={basics.name} 
        className="profile-img" 
      />
      
      <div className="sidebar-content">
        <div className="sidebar-section">
          <h2>Contact</h2>
        <div className="contact-item">
          <span className="contact-icon">📍</span>
          <span>{basics.location}</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon">📧</span>
          {Array.isArray(basics.email) ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {basics.email.map((email, index) => (
                <a key={index} href={`mailto:${email}`}>{email}</a>
              ))}
            </div>
          ) : (
            <a href={`mailto:${basics.email}`}>{basics.email}</a>
          )}
        </div>
        <div className="contact-item">
          <span className="contact-icon">📱</span>
          {basics.phoneUrl ? (
            <a href={basics.phoneUrl} target="_blank" rel="noopener noreferrer">
              {basics.phone}
            </a>
          ) : (
            <span>{basics.phone}</span>
          )}
        </div>
        <div className="contact-item">
          <span className="contact-icon">🌐</span>
          <a href={`https://${basics.website}`} target="_blank" rel="noopener noreferrer">
            {basics.website}
          </a>
        </div>
        
        <div className="social-links">
          {basics.linkedin && (
            <a href={`https://${basics.linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <img src="/images/linkedin.svg" alt="LinkedIn" className="social-icon" />
            </a>
          )}
          {basics.github && (
            <a href={`https://${basics.github}`} target="_blank" rel="noopener noreferrer" title="GitHub">
              <img src="/images/github.svg" alt="GitHub" className="social-icon" />
            </a>
          )}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h2>Personal</h2>
        <div className="contact-item">
          <span className="contact-icon">🎂</span>
          <span>{basics.birthdate}</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon">🌍</span>
          <span>{basics.nationality}</span>
        </div>
      </div>
      
      <div className="sidebar-section">
        <h2>Languages</h2>
        {languages.map((lang, index) => (
          <div className="language-item" key={index}>
            <div className="language-name">{lang.language}</div>
            {lang.fluency && (
              <div className="language-level-note">{lang.fluency}</div>
            )}
            {lang.skills && (
              <>
                <div className="language-level">
                  <div className="language-skill">
                    <div className="skill-label">Listening</div>
                    <div>{lang.skills.listening}</div>
                  </div>
                  <div className="language-skill">
                    <div className="skill-label">Reading</div>
                    <div>{lang.skills.reading}</div>
                  </div>
                  <div className="language-skill">
                    <div className="skill-label">Writing</div>
                    <div>{lang.skills.writing}</div>
                  </div>
                </div>
                <div className="language-level">
                  <div className="language-skill">
                    <div className="skill-label">Spoken Production</div>
                    <div>{lang.skills.spokenProduction}</div>
                  </div>
                  <div className="language-skill">
                    <div className="skill-label">Spoken Interaction</div>
                    <div>{lang.skills.spokenInteraction}</div>
                  </div>
                </div>
                <div className="language-level-note">
                  Levels: A1/A2: Basic user; B1/B2: Independent user; C1/C2: Proficient user
                </div>
              </>
            )}
          </div>
        ))}
        </div>

        <SpinningGlobe />
      </div>
    </div>
  );
};

export default Sidebar;
