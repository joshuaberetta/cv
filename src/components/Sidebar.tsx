import React from 'react';
import QRCode from 'react-qr-code';
import { Basics, Language } from '../types/cv';

interface SidebarProps {
  basics: Basics;
  languages: Language[];
}

const Sidebar: React.FC<SidebarProps> = ({ basics, languages }) => {
  return (
    <div className="sidebar">
      <img 
        src={basics.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + basics.name.split(' ')[0]} 
        alt={basics.name} 
        className="profile-img" 
      />
      
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

      {basics.latestVersionUrl && (
        <div className="sidebar-section no-print">
          <div className="qr-code-container-sidebar">
            <div className="qr-code-wrapper">
              <QRCode 
                value={basics.latestVersionUrl} 
                size={64} 
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            <a href={basics.latestVersionUrl} target="_blank" rel="noopener noreferrer" className="qr-link" style={{ textAlign: 'center' }}>
              Latest Version<br/>cv.joshuaberetta.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
