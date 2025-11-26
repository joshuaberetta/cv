import React, { useEffect, useState } from 'react';
import { GlobeLocation, Journey, GlobeData } from '../types/globe';

interface LocationDetailProps {
  location: GlobeLocation | null;
  journey: Journey | null;
  onClose: () => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({ location, journey, onClose }) => {
  const [globeData, setGlobeData] = useState<GlobeData | null>(null);

  useEffect(() => {
    fetch('/data/globe-data.json')
      .then(res => res.json())
      .then(setGlobeData)
      .catch(console.error);
  }, []);

  // Get journey locations if viewing a journey
  const journeyLocations = journey && globeData
    ? journey.locations
        .map(id => globeData.locations.find(l => l.id === id))
        .filter((l): l is GlobeLocation => l !== undefined)
    : [];

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'deployment': return 'Deployment';
      case 'training': return 'Training / Workshop';
      case 'travel': return 'Travel';
      default: return type;
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'deployment': return '#ef4444';
      case 'training': return '#3b82f6';
      case 'travel': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {location && (
          <div className="detail-content">
            <div className="detail-header">
              <span
                className="detail-type-badge"
                style={{ backgroundColor: getTypeColor(location.type) }}
              >
                {getTypeLabel(location.type)}
              </span>
              {location.date && <span className="detail-date">{location.date}</span>}
            </div>

            <h2 className="detail-title">
              {location.title || `${location.name}, ${location.country}`}
            </h2>

            {location.title && (
              <p className="detail-location">
                <svg viewBox="0 0 24 24" fill="currentColor" className="location-icon">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {location.name}, {location.country}
              </p>
            )}

            {location.description && (
              <div className="detail-description">
                <p>{location.description}</p>
              </div>
            )}

            {location.images && location.images.length > 0 && (
              <div className="detail-images">
                {location.images.map((img, index) => (
                  <img key={index} src={img} alt={`${location.name} ${index + 1}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {journey && (
          <div className="detail-content">
            <div className="detail-header">
              <span
                className="detail-type-badge"
                style={{ backgroundColor: journey.color || '#10b981' }}
              >
                Journey
              </span>
              {journey.date && <span className="detail-date">{journey.date}</span>}
            </div>

            <h2 className="detail-title">{journey.name}</h2>

            {journey.description && (
              <div className="detail-description">
                <p>{journey.description}</p>
              </div>
            )}

            <div className="journey-stops">
              <h3>Route ({journeyLocations.length} stops)</h3>
              <div className="stops-timeline">
                {journeyLocations.map((loc, index) => (
                  <div key={loc.id} className="stop-item">
                    <div className="stop-marker">
                      <span className="stop-number">{index + 1}</span>
                      {index < journeyLocations.length - 1 && <div className="stop-line" />}
                    </div>
                    <div className="stop-content">
                      <h4>{loc.name}, {loc.country}</h4>
                      {loc.description && <p>{loc.description}</p>}
                      {loc.images && loc.images.length > 0 && (
                        <div className="stop-images">
                          {loc.images.slice(0, 2).map((img, i) => (
                            <img key={i} src={img} alt={`${loc.name} ${i + 1}`} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {journey.images && journey.images.length > 0 && (
              <div className="detail-images">
                {journey.images.map((img, index) => (
                  <img key={index} src={img} alt={`${journey.name} ${index + 1}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetail;
