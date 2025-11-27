import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PortfolioGlobe from '../components/PortfolioGlobe';
import LocationDetail from '../components/LocationDetail';
import Carousel from '../components/Carousel';
import Modal from '../components/Modal';
import MultiSelectFilter from '../components/MultiSelectFilter';
import SideNav from '../components/SideNav';
import { GlobeLocation, Journey } from '../types/globe';
import { Training, WorkExperience } from '../types/cv';
import { ProjectContent, TrainingContent, WorkContent, TripContent } from '../types/content';
import ReactMarkdown from 'react-markdown';
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
  projects: ProjectContent[];
  trainingsContent?: TrainingContent[];
  workContent?: WorkContent[];
  tripsContent?: TripContent[];
}

const GlobePage: React.FC<GlobePageProps> = ({ 
  basics, 
  work = [], 
  trainings = [], 
  projects,
  trainingsContent = [],
  workContent = [],
  tripsContent = []
}) => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<GlobeLocation | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<{
    type: 'project' | 'training' | 'work' | 'trip' | null;
    data: any;
  }>({ type: null, data: null });

  // Filter states for each section (multi-select)
  const [projectTagFilters, setProjectTagFilters] = useState<string[]>([]);
  const [trainingCountryFilters, setTrainingCountryFilters] = useState<string[]>([]);
  const [trainingYearFilters, setTrainingYearFilters] = useState<string[]>([]);
  const [trainingLanguageFilters, setTrainingLanguageFilters] = useState<string[]>([]);
  const [workCompanyFilters, setWorkCompanyFilters] = useState<string[]>([]);
  const [workLocationFilters, setWorkLocationFilters] = useState<string[]>([]);
  const [tripCountryFilters, setTripCountryFilters] = useState<string[]>([]);
  const [tripPurposeFilters, setTripPurposeFilters] = useState<string[]>([]);

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

  const handleOpenModal = (type: 'project' | 'training' | 'work' | 'trip', data: any) => {
    setModalContent({ type, data });
    // Update URL without navigating
    if (data.slug) {
      window.history.pushState({}, '', `/${type}s/${data.slug}`);
    }
  };

  const handleCloseModal = () => {
    setModalContent({ type: null, data: null });
    // Restore URL to globe page
    window.history.pushState({}, '', '/globe');
  };

  // Helper to get first paragraph from markdown body
  const getPreviewText = (body: string): string => {
    // Remove markdown formatting and get first paragraph
    const lines = body.split('\n').filter(line => line.trim());
    const firstParagraph = lines.find(line => 
      !line.startsWith('#') && 
      !line.startsWith('-') && 
      !line.startsWith('*') &&
      !line.startsWith('>')
    );
    if (!firstParagraph) return '';
    
    // Truncate at word boundary
    const maxLength = 100;
    if (firstParagraph.length <= maxLength) return firstParagraph;
    
    const truncated = firstParagraph.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  // Use markdown content if available, otherwise fall back to YAML
  const displayTrainings = trainingsContent.length > 0 ? trainingsContent : trainings;
  const displayWork = workContent.length > 0 ? workContent : work;

  // Extract unique values for filters
  const allProjectTags = Array.from(new Set(projects.flatMap(p => p.tags))).sort();
  
  const allTrainingCountries = Array.from(
    new Set(displayTrainings.map(t => {
      if ('country' in t && t.country) return t.country as string;
      return (t.location.split(',').pop()?.trim() || t.location) as string;
    }))
  ).sort();
  
  const allTrainingYears = Array.from(
    new Set(displayTrainings.map(t => t.year))
  ).sort().reverse();
  
  const allTrainingLanguages = Array.from(
    new Set(displayTrainings.filter(t => t.language).map(t => t.language!))
  ).sort();

  const allWorkCompanies = Array.from(
    new Set(displayWork.map(w => w.company))
  ).sort();
  
  const allWorkLocations = Array.from(
    new Set(displayWork.map(w => w.location))
  ).sort();

  const allTripCountries = Array.from(
    new Set(tripsContent.map(t => t.country))
  ).sort();
  
  const allTripPurposes = Array.from(
    new Set(tripsContent.filter(t => t.purpose).map(t => t.purpose!))
  ).sort();

  // Filter data based on active filters (multi-select)
  const filteredProjects = projectTagFilters.length > 0
    ? projects.filter(p => projectTagFilters.some(tag => p.tags.includes(tag)))
    : projects;

  const filteredTrainings = displayTrainings.filter(t => {
    if (trainingCountryFilters.length > 0) {
      const country: string = ('country' in t && t.country) ? t.country as string : (t.location.split(',').pop()?.trim() || t.location) as string;
      if (!trainingCountryFilters.includes(country)) return false;
    }
    if (trainingYearFilters.length > 0 && !trainingYearFilters.includes(t.year)) return false;
    if (trainingLanguageFilters.length > 0 && (!t.language || !trainingLanguageFilters.includes(t.language))) return false;
    return true;
  });

  const filteredWork = displayWork.filter(w => {
    if (workCompanyFilters.length > 0 && !workCompanyFilters.includes(w.company)) return false;
    if (workLocationFilters.length > 0 && !workLocationFilters.includes(w.location)) return false;
    return true;
  });

  const filteredTrips = tripsContent.filter(t => {
    if (tripCountryFilters.length > 0 && !tripCountryFilters.includes(t.country)) return false;
    if (tripPurposeFilters.length > 0 && (!t.purpose || !tripPurposeFilters.includes(t.purpose))) return false;
    return true;
  });

  // Navigation sections
  const navSections = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'trainings', label: 'Trainings' },
    { id: 'trips', label: 'Trips' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="globe-page">
      {/* Side Navigation */}
      <SideNav sections={navSections} />

      {/* Hero Section with Globe */}
      <section className="hero-section" id="hero">
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
              <span className="stat-number">{Array.from(new Set([
                ...tripsContent.map(t => t.country),
                ...displayTrainings.map(t => 'country' in t ? t.country : t.location.split(',').pop()?.trim() || t.location)
              ])).length}</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{displayTrainings.length}</span>
              <span className="stat-label">Trainings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{displayWork.length}</span>
              <span className="stat-label">Positions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="projects-section" id="projects">
        <div className="section-content">
          <h2>Projects & Tools</h2>
          
          {/* Project Tag Filters */}
          <div className="section-filters">
            <MultiSelectFilter
              id="project-tag-filter"
              label="Filter by Tag:"
              options={allProjectTags.map(tag => ({
                value: tag,
                label: tag,
                count: projects.filter(p => p.tags.includes(tag)).length
              }))}
              selectedValues={projectTagFilters}
              onChange={setProjectTagFilters}
              placeholder="All Projects"
            />
          </div>

          {filteredProjects.length > 0 ? (
            <Carousel itemsPerView={3} gap={24}>
              {filteredProjects.map((project, index) => (
                <div
                  key={index}
                  className="carousel-square-card project-card"
                  onClick={() => handleOpenModal('project', project)}
                >
                  <div className="card-content">
                    <h3>{project.name}</h3>
                    <div className="card-preview">
                      <p className="preview-text">{project.description}</p>
                      <div className="tags-container">
                        {project.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="tag-mini">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card-expand-hint">Click to expand</div>
                </div>
              ))}
            </Carousel>
          ) : (
            <div className="no-results">
              <p>No projects match the selected filter.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trainings Section */}
      {trainings && trainings.length > 0 && (
        <section className="trainings-section" id="trainings">
          <div className="section-content">
            <h2>Trainings & Workshops</h2>
            
            {/* Training Filters */}
            <div className="section-filters">
              <MultiSelectFilter
                id="training-country-filter"
                label="Country:"
                options={allTrainingCountries.map(country => ({
                  value: country,
                  label: country,
                  count: trainings.filter(t => 
                    (t.location.split(',').pop()?.trim() || t.location) === country
                  ).length
                }))}
                selectedValues={trainingCountryFilters}
                onChange={setTrainingCountryFilters}
                placeholder="All Countries"
              />

              <MultiSelectFilter
                id="training-year-filter"
                label="Year:"
                options={allTrainingYears.map(year => ({
                  value: year,
                  label: year,
                  count: trainings.filter(t => t.year === year).length
                }))}
                selectedValues={trainingYearFilters}
                onChange={setTrainingYearFilters}
                placeholder="All Years"
              />

              <MultiSelectFilter
                id="training-language-filter"
                label="Language:"
                options={allTrainingLanguages.map(language => ({
                  value: language,
                  label: language,
                  count: trainings.filter(t => t.language === language).length
                }))}
                selectedValues={trainingLanguageFilters}
                onChange={setTrainingLanguageFilters}
                placeholder="All Languages"
              />
            </div>

            {filteredTrainings.length > 0 ? (
              <Carousel itemsPerView={3} gap={24}>
                {filteredTrainings.map((training, index) => {
                  // Handle both TrainingContent and Training types
                  const isContentType = 'name' in training;
                  const title = isContentType ? (training as TrainingContent).name : (training as Training).organization;
                  const description = isContentType 
                    ? (training as TrainingContent).description 
                    : `${(training as Training).location} • ${(training as Training).year}`;
                  
                  return (
                    <div 
                      key={index} 
                      className="carousel-square-card training-card"
                      onClick={() => handleOpenModal('training', training)}
                    >
                      <div className="card-content">
                        <h3>{title}</h3>
                        <div className="card-preview">
                          <p className="preview-text">{description}</p>
                        </div>
                      </div>
                      <div className="card-expand-hint">Click to expand</div>
                    </div>
                  );
                })}
              </Carousel>
            ) : (
              <div className="no-results">
                <p>No trainings match the selected filters.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setTrainingCountryFilters([]);
                    setTrainingYearFilters([]);
                    setTrainingLanguageFilters([]);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trips Section */}
      {tripsContent && tripsContent.length > 0 && (
        <section className="trips-section" id="trips">
          <div className="section-content">
            <h2>Travel & Field Visits</h2>
            
            {/* Trip Filters */}
            <div className="section-filters">
              <MultiSelectFilter
                id="trip-country-filter"
                label="Country:"
                options={allTripCountries.map(country => ({
                  value: country,
                  label: country,
                  count: tripsContent.filter(t => t.country === country).length
                }))}
                selectedValues={tripCountryFilters}
                onChange={setTripCountryFilters}
                placeholder="All Countries"
              />

              <MultiSelectFilter
                id="trip-purpose-filter"
                label="Purpose:"
                options={allTripPurposes.map(purpose => ({
                  value: purpose,
                  label: purpose,
                  count: tripsContent.filter(t => t.purpose === purpose).length
                }))}
                selectedValues={tripPurposeFilters}
                onChange={setTripPurposeFilters}
                placeholder="All Purposes"
              />
            </div>

            {filteredTrips.length > 0 ? (
              <Carousel itemsPerView={3} gap={24}>
                {filteredTrips.map((trip, index) => (
                    <div 
                      key={index} 
                      className="carousel-square-card trip-card"
                      onClick={() => handleOpenModal('trip', trip)}
                    >
                      <div className="card-content">
                        <h3>{trip.destination}</h3>
                        <div className="card-preview">
                          <p className="preview-text">{trip.description}</p>
                        </div>
                        {trip.tags && trip.tags.length > 0 && (
                          <div className="tags-container">
                            {trip.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="tag-mini">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="card-expand-hint">Click to expand</div>
                    </div>
                  ))}
              </Carousel>
            ) : (
              <div className="no-results">
                <p>No trips match the selected filters.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setTripCountryFilters([]);
                    setTripPurposeFilters([]);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Work Experience Section */}
      {work && work.length > 0 && (
        <section className="work-section" id="experience">
          <div className="section-content">
            <h2>Work Experience</h2>
            
            {/* Work Filters */}
            <div className="section-filters">
              <MultiSelectFilter
                id="work-company-filter"
                label="Company:"
                options={allWorkCompanies.map(company => ({
                  value: company,
                  label: company,
                  count: work.filter(w => w.company === company).length
                }))}
                selectedValues={workCompanyFilters}
                onChange={setWorkCompanyFilters}
                placeholder="All Companies"
              />

              <MultiSelectFilter
                id="work-location-filter"
                label="Location:"
                options={allWorkLocations.map(location => ({
                  value: location,
                  label: location,
                  count: work.filter(w => w.location === location).length
                }))}
                selectedValues={workLocationFilters}
                onChange={setWorkLocationFilters}
                placeholder="All Locations"
              />
            </div>

            {filteredWork.length > 0 ? (
              <Carousel itemsPerView={3} gap={24}>
                {filteredWork.map((job, index) => (
                  <div 
                    key={index} 
                    className="carousel-square-card work-card"
                    onClick={() => handleOpenModal('work', job)}
                  >
                    <div className="card-content">
                      <h3>{job.position}</h3>
                      <div className="card-preview">
                        <p className="preview-text">{job.description}</p>
                      </div>
                    </div>
                    <div className="card-expand-hint">Click to expand</div>
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="no-results">
                <p>No work experiences match the selected filters.</p>
                <button
                  className="reset-filters-btn"
                  onClick={() => {
                    setWorkCompanyFilters([]);
                    setWorkLocationFilters([]);
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
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
            <div className="modal-tags">
              {modalContent.data.tags.map((tag: string, i: number) => (
                <span key={i} className="modal-tag">{tag}</span>
              ))}
            </div>
            <div className="modal-markdown-content">
              <ReactMarkdown>{modalContent.data.body}</ReactMarkdown>
            </div>
            {modalContent.data.url && (
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
            )}
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
            {modalContent.data.body && (
              <div className="modal-markdown-content">
                <ReactMarkdown>{modalContent.data.body}</ReactMarkdown>
              </div>
            )}
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
            {modalContent.data.body ? (
              <div className="modal-markdown-content">
                <ReactMarkdown>{modalContent.data.body}</ReactMarkdown>
              </div>
            ) : modalContent.data.description && (
              <p style={{ marginTop: '1.5rem' }}>{modalContent.data.description}</p>
            )}
          </div>
        )}
        {modalContent.type === 'trip' && modalContent.data && (
          <div className="modal-body">
            <h2>{modalContent.data.name}</h2>
            <h3>{modalContent.data.destination}</h3>
            <div className="modal-details">
              <span className="modal-detail-item">📍 {modalContent.data.country}</span>
              <span className="modal-detail-item">
                📅 {modalContent.data.startDate} - {modalContent.data.endDate}
              </span>
              {modalContent.data.purpose && (
                <span className="modal-detail-item">🎯 {modalContent.data.purpose}</span>
              )}
            </div>
            {modalContent.data.tags && modalContent.data.tags.length > 0 && (
              <div className="modal-tags">
                {modalContent.data.tags.map((tag: string, i: number) => (
                  <span key={i} className="modal-tag">{tag}</span>
                ))}
              </div>
            )}
            {modalContent.data.body && (
              <div className="modal-markdown-content">
                <ReactMarkdown>{modalContent.data.body}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GlobePage;
