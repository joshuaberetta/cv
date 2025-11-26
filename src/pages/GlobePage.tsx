import React, { useState } from 'react';
import PortfolioGlobe from '../components/PortfolioGlobe';
import LocationDetail from '../components/LocationDetail';
import Carousel from '../components/Carousel';
import Modal from '../components/Modal';
import { GlobeLocation, Journey } from '../types/globe';
import { Training, WorkExperience } from '../types/cv';
import './globe-page.css';

interface GlobePageProps {
  basics: {
    name: string;
    email: string | string[];
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
  };
  work?: WorkExperience[];
  trainings?: Training[];
}

const GlobePage: React.FC<GlobePageProps> = ({ basics, work = [], trainings = [] }) => {
  const [selectedLocation, setSelectedLocation] = useState<GlobeLocation | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{
    type: 'project' | 'training' | 'work' | null;
    data: any;
  }>({ type: null, data: null });

  const handleLocationSelect = (location: GlobeLocation | null) => {
    setSelectedLocation(location);
    setSelectedJourney(null);
  };

  const handleJourneySelect = (journey: Journey | null) => {
    setSelectedJourney(journey);
    setSelectedLocation(null);
  };

  const handleCloseDetail = () => {
    setSelectedLocation(null);
    setSelectedJourney(null);
  };

  const handleOpenModal = (type: 'project' | 'training' | 'work', data: any) => {
    setModalContent({ type, data });
  };

  const handleCloseModal = () => {
    setModalContent({ type: null, data: null });
  };

  const projects = [
    {
      name: 'KoboToolbox',
      description: 'Core backend developer and humanitarian project coordinator for the leading open-source data collection platform used by UN agencies and NGOs worldwide.',
      url: 'https://github.com/kobotoolbox',
      tags: ['Python', 'Django', 'Open Source', 'Humanitarian']
    },
    {
      name: 'SIMS Portal',
      description: 'Information management support platform for IFRC surge volunteers during humanitarian emergencies.',
      url: 'https://github.com/JonathanGarro/SIMS-Portal',
      tags: ['Python', 'Flask', 'Humanitarian', 'IFRC']
    },
    {
      name: 'CV Generator',
      description: 'This very site! A React-based CV generator with PDF export, multiple templates, and now an interactive globe.',
      url: 'https://github.com/joshuaberetta/cv',
      tags: ['React', 'TypeScript', 'D3.js']
    },
    {
      name: 'Portfolio',
      description: 'Personal portfolio website with a unique terminal-inspired design and interactive elements.',
      url: 'https://joshuaberetta.com',
      tags: ['React', 'TypeScript', 'Design']
    },
    {
      name: 'Humanitarian Data Tools',
      description: 'Collection of open-source tools and utilities for humanitarian data collection and analysis.',
      url: 'https://github.com/joshuaberetta',
      tags: ['Open Source', 'Data Science', 'Tools']
    },
    {
      name: 'AI for Humanitarians',
      description: 'Research and implementation of responsible AI solutions for humanitarian data collection in crisis contexts.',
      url: 'https://github.com/joshuaberetta',
      tags: ['AI/ML', 'Research', 'Humanitarian']
    }
  ];

  return (
    <div className="globe-page">
      {/* Hero Section with Globe */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{basics.name}</h1>
            <p className="hero-tagline">Humanitarian technologist exploring the world</p>
            <div className="hero-links">
              {basics.github && (
                <a href={`https://${basics.github}`} target="_blank" rel="noopener noreferrer" className="hero-link">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
              {basics.linkedin && (
                <a href={`https://${basics.linkedin}`} target="_blank" rel="noopener noreferrer" className="hero-link">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              )}
              <a href="/" className="hero-link">
                <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h6v6h6v10H6z"/>
                </svg>
                View CV
              </a>
            </div>
          </div>
          <div className="hero-globe">
            <PortfolioGlobe
              onLocationSelect={handleLocationSelect}
              onJourneySelect={handleJourneySelect}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedLocation={selectedLocation}
              selectedJourney={selectedJourney}
            />
          </div>
        </div>
      </section>

      {/* Detail Panel */}
      {(selectedLocation || selectedJourney) && (
        <LocationDetail
          location={selectedLocation}
          journey={selectedJourney}
          onClose={handleCloseDetail}
        />
      )}

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="section-content">
          <h2>About</h2>
          <p>{basics.summary || 'Humanitarian technology professional combining technical expertise with field experience.'}</p>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">20+</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">30+</span>
              <span className="stat-label">Trainings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">Years in Tech</span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section" id="projects">
        <div className="section-content">
          <h2>Projects & Tools</h2>
          <Carousel itemsPerView={3} gap={24}>
            {projects.map((project, index) => (
              <div
                key={index}
                className="carousel-square-card project-card"
                onClick={() => handleOpenModal('project', project)}
              >
                <div className="card-content">
                  <h3>{project.name}</h3>
                  <div className="card-preview">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag-mini">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="card-expand-hint">Click to expand</div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Trainings Section */}
      {trainings && trainings.length > 0 && (
        <section className="trainings-section" id="trainings">
          <div className="section-content">
            <h2>Trainings & Workshops</h2>
            <Carousel itemsPerView={3} gap={24}>
              {trainings.map((training, index) => (
                <div 
                  key={index} 
                  className="carousel-square-card training-card"
                  onClick={() => handleOpenModal('training', training)}
                >
                  <div className="card-content">
                    <h3>{training.organization}</h3>
                    <div className="card-preview">
                      <span className="preview-text">📍 {training.location}</span>
                      <span className="preview-text">📅 {training.year}</span>
                    </div>
                  </div>
                  <div className="card-expand-hint">Click to expand</div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Work Experience Section */}
      {work && work.length > 0 && (
        <section className="work-section" id="experience">
          <div className="section-content">
            <h2>Work Experience</h2>
            <Carousel itemsPerView={3} gap={24}>
              {work.map((job, index) => (
                <div 
                  key={index} 
                  className="carousel-square-card work-card"
                  onClick={() => handleOpenModal('work', job)}
                >
                  <div className="card-content">
                    <h3>{job.position}</h3>
                    <div className="card-preview">
                      <span className="preview-text">{job.company}</span>
                      <span className="preview-text">📍 {job.location}</span>
                    </div>
                  </div>
                  <div className="card-expand-hint">Click to expand</div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <div className="section-content">
          <h2>Get in Touch</h2>
          <div className="contact-grid">
            <a href={`mailto:${Array.isArray(basics.email) ? basics.email[0] : basics.email}`} className="contact-item">
              <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>{Array.isArray(basics.email) ? basics.email[0] : basics.email}</span>
            </a>
            {basics.website && (
              <a href={`https://${basics.website}`} target="_blank" rel="noopener noreferrer" className="contact-item">
                <svg viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span>{basics.website}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="globe-footer">
        <p>&copy; {new Date().getFullYear()} {basics.name}</p>
      </footer>

      {/* Modal */}
      <Modal isOpen={modalContent.type !== null} onClose={handleCloseModal}>
        {modalContent.type === 'project' && modalContent.data && (
          <div className="modal-body">
            <h2>{modalContent.data.name}</h2>
            <p>{modalContent.data.description}</p>
            <div className="modal-tags">
              {modalContent.data.tags.map((tag: string, i: number) => (
                <span key={i} className="modal-tag">{tag}</span>
              ))}
            </div>
            <a 
              href={modalContent.data.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="modal-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Project
            </a>
          </div>
        )}
        {modalContent.type === 'training' && modalContent.data && (
          <div className="modal-body">
            <h2>{modalContent.data.organization}</h2>
            <h3>{modalContent.data.course}</h3>
            <div className="modal-details">
              <span className="modal-detail-item">📍 {modalContent.data.location}</span>
              <span className="modal-detail-item">📅 {modalContent.data.year}</span>
              {modalContent.data.language && (
                <span className="modal-detail-item">🗣️ {modalContent.data.language}</span>
              )}
            </div>
          </div>
        )}
        {modalContent.type === 'work' && modalContent.data && (
          <div className="modal-body">
            <h2>{modalContent.data.position}</h2>
            <h3>{modalContent.data.company}</h3>
            <div className="modal-details">
              <span className="modal-detail-item">📍 {modalContent.data.location}</span>
              <span className="modal-detail-item">
                📅 {modalContent.data.startDate} - {modalContent.data.endDate}
              </span>
            </div>
            {modalContent.data.description && (
              <p style={{ marginTop: '1.5rem' }}>{modalContent.data.description}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GlobePage;
