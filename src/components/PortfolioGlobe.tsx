import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { GlobeLocation, Journey, GlobeData } from '../types/globe';

// Map countries to regions
const countryToRegion: Record<string, string> = {
  'South Africa': 'Africa',
  'Kenya': 'Africa',
  'Tanzania': 'Africa',
  'Ethiopia': 'Africa',
  'Jamaica': 'Americas',
  'Dominican Republic': 'Americas',
  'Colombia': 'Americas',
  'Peru': 'Americas',
  'Argentina': 'Americas',
  'USA': 'Americas',
  'Timor-Leste': 'Asia-Pacific',
  'Thailand': 'Asia-Pacific',
  'Afghanistan': 'Asia',
  'Jordan': 'Middle East',
  'UAE': 'Middle East',
  'Türkiye': 'Europe',
  'Poland': 'Europe',
  'Netherlands': 'Europe',
  'Spain': 'Europe',
  'Portugal': 'Europe',
  'France': 'Europe',
  'United Kingdom': 'Europe',
  'Germany': 'Europe',
  'Italy': 'Europe',
};

const getRegion = (country: string): string => {
  return countryToRegion[country] || 'Other';
};

interface FilterState {
  type: string;
  country: string;
  region: string;
}

interface PortfolioGlobeProps {
  onLocationSelect: (location: GlobeLocation | null) => void;
  onJourneySelect: (journey: Journey | null) => void;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  selectedLocation: GlobeLocation | null;
  selectedJourney: Journey | null;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: {
    title: string;
    subtitle: string;
    type: string;
  } | null;
}

const PortfolioGlobe: React.FC<PortfolioGlobeProps> = ({
  onLocationSelect,
  onJourneySelect,
  activeFilter,
  onFilterChange,
  selectedLocation,
  selectedJourney
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null
  });
  const [isSpinning, setIsSpinning] = useState(true);
  const [globeData, setGlobeData] = useState<GlobeData | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    country: '',
    region: ''
  });
  const timerRef = useRef<d3.Timer | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const isSpinningRef = useRef(true);

  // Derive unique filter options from locations
  const filterOptions = useMemo(() => {
    if (!globeData) return { types: [], countries: [], regions: [] };
    const types = [...new Set(globeData.locations.map(l => l.type))];
    const countries = [...new Set(globeData.locations.map(l => l.country))].sort();
    const regions = [...new Set(globeData.locations.map(l => getRegion(l.country)))].sort();
    return { types, countries, regions };
  }, [globeData]);

  // Apply filters to locations
  const computedFilteredLocations = useMemo(() => {
    if (!globeData) return [];
    return globeData.locations.filter(location => {
      if (filters.type && location.type !== filters.type) return false;
      if (filters.country && location.country !== filters.country) return false;
      if (filters.region && getRegion(location.country) !== filters.region) return false;
      return true;
    });
  }, [globeData, filters]);

  const handleFilterChange = (filterKey: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', country: '', region: '' });
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'deployment': return '#ef4444';
      case 'training': return '#3b82f6';
      case 'travel': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getMarkerSize = (type: string, isSelected: boolean): number => {
    const base = type === 'deployment' ? 6 : type === 'training' ? 5 : 4;
    return isSelected ? base * 1.5 : base;
  };

  // Load data
  useEffect(() => {
    fetch('/data/globe-data.json')
      .then(res => res.json())
      .then((data: GlobeData) => setGlobeData(data))
      .catch(err => console.error('Error loading globe data:', err));
  }, []);

  const drawGlobe = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !globeData) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = width;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const projection = d3.geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(width / 2.3)
      .clipAngle(90);

    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const center: [number, number] = [width / 2, height / 2];

    // Defs for glow effect
    const defs = svg.append('defs');

    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Globe background with subtle glow
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .attr('class', 'portfolio-globe-ocean');

    // Graticule
    const graticule = d3.geoGraticule().step([15, 15]);
    svg.append('path')
      .datum(graticule())
      .attr('class', 'portfolio-globe-graticule')
      .attr('d', path as any);

    // Countries group
    const countriesGroup = svg.append('g').attr('class', 'countries');

    // Journey lines group (below markers)
    const journeyGroup = svg.append('g').attr('class', 'journeys');

    // Markers group
    const markerGroup = svg.append('g').attr('class', 'markers');

    const config = {
      speed: 0.006,
      verticalTilt: 20,
      horizontalTilt: 0
    };

    // Load world data
    d3.json('/data/world-110m.json').then((worldData: any) => {
      if (!worldData) return;

      const countries = topojson.feature(worldData, worldData.objects.countries);
      countriesGroup.selectAll('.country')
        .data((countries as any).features)
        .enter()
        .append('path')
        .attr('class', 'portfolio-globe-country')
        .attr('d', path as any);

      // Use computed filtered locations
      const filteredLocations = computedFilteredLocations;

      // Get journeys to display (show when travel filter or no filters active)
      const visibleJourneys = filters.type === 'travel' || !filters.type
        ? globeData.journeys
        : [];

      // Draw journey lines
      const drawJourneys = () => {
        journeyGroup.selectAll('*').remove();

        visibleJourneys.forEach(journey => {
          const journeyLocations = journey.locations
            .map(id => globeData.locations.find(l => l.id === id))
            .filter((l): l is GlobeLocation => l !== undefined);

          if (journeyLocations.length < 2) return;

          // Create path segments
          for (let i = 0; i < journeyLocations.length - 1; i++) {
            const start = journeyLocations[i];
            const end = journeyLocations[i + 1];

            const startCoord: [number, number] = [start.longitude, start.latitude];
            const endCoord: [number, number] = [end.longitude, end.latitude];

            // Check if both points are visible
            const inverted = projection.invert?.(center);
            if (!inverted) continue;

            const startDist = d3.geoDistance(startCoord, inverted);
            const endDist = d3.geoDistance(endCoord, inverted);

            // Only draw if at least one point is visible
            if (startDist > Math.PI / 2 && endDist > Math.PI / 2) continue;

            // Create great circle path
            const lineGenerator = d3.geoPath().projection(projection);
            const lineFeature: GeoJSON.Feature = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [startCoord, endCoord]
              }
            };

            const isJourneySelected = selectedJourney?.id === journey.id;

            journeyGroup.append('path')
              .datum(lineFeature)
              .attr('d', lineGenerator as any)
              .attr('class', 'journey-line')
              .attr('stroke', journey.color || '#10b981')
              .attr('stroke-width', isJourneySelected ? 3 : 2)
              .attr('stroke-opacity', isJourneySelected ? 1 : 0.6)
              .attr('fill', 'none')
              .attr('stroke-dasharray', '4,2')
              .style('cursor', 'pointer')
              .style('filter', isJourneySelected ? 'url(#glow)' : 'none')
              .on('click', (event) => {
                event.stopPropagation();
                onJourneySelect(journey);
              })
              .on('mouseenter', function(event) {
                d3.select(this)
                  .attr('stroke-width', 4)
                  .attr('stroke-opacity', 1);

                const rect = container.getBoundingClientRect();
                setTooltip({
                  visible: true,
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                  content: {
                    title: journey.name,
                    subtitle: `${journeyLocations.length} stops`,
                    type: 'journey'
                  }
                });
              })
              .on('mouseleave', function() {
                d3.select(this)
                  .attr('stroke-width', isJourneySelected ? 3 : 2)
                  .attr('stroke-opacity', isJourneySelected ? 1 : 0.6);
                setTooltip(prev => ({ ...prev, visible: false }));
              });
          }
        });
      };

      // Draw markers
      const drawMarkers = () => {
        const markers = markerGroup.selectAll<SVGCircleElement, GlobeLocation>('circle')
          .data(filteredLocations, d => d.id);

        markers.exit().remove();

        const enterMarkers = markers.enter()
          .append('circle')
          .attr('class', 'portfolio-globe-marker')
          .style('cursor', 'pointer')
          .on('mouseenter', function(event, d) {
            const coordinate: [number, number] = [d.longitude, d.latitude];
            const inverted = projection.invert?.(center);
            if (!inverted) return;
            const gdistance = d3.geoDistance(coordinate, inverted);
            if (gdistance > Math.PI / 2) return;

            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', getMarkerSize(d.type, true) * 1.3);

            const rect = container.getBoundingClientRect();
            setTooltip({
              visible: true,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              content: {
                title: d.title || `${d.name}, ${d.country}`,
                subtitle: d.date || '',
                type: d.type
              }
            });
          })
          .on('mouseleave', function(_, d) {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', getMarkerSize(d.type, selectedLocation?.id === d.id));
            setTooltip(prev => ({ ...prev, visible: false }));
          })
          .on('click', function(event, d) {
            event.stopPropagation();
            const coordinate: [number, number] = [d.longitude, d.latitude];
            const inverted = projection.invert?.(center);
            if (!inverted) return;
            const gdistance = d3.geoDistance(coordinate, inverted);
            if (gdistance > Math.PI / 2) return;

            // Stop spinning and rotate to clicked location
            if (timerRef.current) {
              timerRef.current.stop();
            }
            isSpinningRef.current = false;
            setIsSpinning(false);

            onLocationSelect(d);

            const currentRotation = projection.rotate();
            const targetRotation: [number, number, number] = [-d.longitude, -d.latitude + 10, 0];
            d3.transition()
              .duration(1000)
              .tween('rotate', () => {
                const interpolate = d3.interpolate(currentRotation, targetRotation);
                return (t) => {
                  projection.rotate(interpolate(t) as [number, number, number]);
                  updateGlobe();
                };
              });
          });

        // Update all markers (both new and existing)
        enterMarkers.merge(markers)
          .attr('cx', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[0] : 0;
          })
          .attr('cy', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[1] : 0;
          })
          .attr('r', d => getMarkerSize(d.type, selectedLocation?.id === d.id))
          .attr('fill', d => {
            const coordinate: [number, number] = [d.longitude, d.latitude];
            const inverted = projection.invert?.(center);
            if (!inverted) return 'none';
            const gdistance = d3.geoDistance(coordinate, inverted);
            return gdistance > Math.PI / 2 ? 'none' : getMarkerColor(d.type);
          })
          .attr('stroke', d => {
            const coordinate: [number, number] = [d.longitude, d.latitude];
            const inverted = projection.invert?.(center);
            if (!inverted) return 'none';
            const gdistance = d3.geoDistance(coordinate, inverted);
            return gdistance > Math.PI / 2 ? 'none' : 'rgba(255,255,255,0.8)';
          })
          .attr('stroke-width', d => selectedLocation?.id === d.id ? 2 : 1.5)
          .style('filter', d => selectedLocation?.id === d.id ? 'url(#glow)' : 'none');

        markerGroup.each(function () {
          this.parentNode?.appendChild(this);
        });
      };

      const updateGlobe = () => {
        svg.selectAll('.portfolio-globe-country').attr('d', path as any);
        svg.selectAll('.portfolio-globe-graticule').attr('d', path as any);
        drawJourneys();
        drawMarkers();
      };

      // Initial draw
      updateGlobe();

      // Auto-rotation
      if (isSpinningRef.current) {
        timerRef.current = d3.timer((elapsed) => {
          projection.rotate([
            config.speed * elapsed - 30,
            config.verticalTilt,
            config.horizontalTilt
          ]);
          updateGlobe();
        });
      }

      // Drag behavior
      const drag = d3.drag<SVGSVGElement, unknown>()
        .on('start', () => {
          if (timerRef.current) {
            timerRef.current.stop();
          }
          isSpinningRef.current = false;
          setIsSpinning(false);
        })
        .on('drag', (event) => {
          const rotate = projection.rotate();
          const sensitivity = 0.4;
          projection.rotate([
            rotate[0] + event.dx * sensitivity,
            Math.max(-60, Math.min(60, rotate[1] - event.dy * sensitivity)),
            rotate[2]
          ]);
          updateGlobe();
        });

      svg.call(drag);

      // Click on globe to deselect
      svg.on('click', () => {
        onLocationSelect(null);
        onJourneySelect(null);
      });

    }).catch(err => {
      console.error('Error loading world data:', err);
    });

    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, [globeData, filters, computedFilteredLocations, selectedLocation, selectedJourney, onLocationSelect, onJourneySelect]);

  useEffect(() => {
    const cleanup = drawGlobe();
    return cleanup;
  }, [drawGlobe]);

  const handlePlayPause = () => {
    if (isSpinningRef.current && timerRef.current) {
      timerRef.current.stop();
    }
    isSpinningRef.current = !isSpinningRef.current;
    setIsSpinning(isSpinningRef.current);
  };

  const typeLabels: Record<string, string> = {
    'deployment': 'Deployment',
    'training': 'Training',
    'travel': 'Travel',
  };

  return (
    <div className="portfolio-globe-container" ref={containerRef}>
      <div className="portfolio-globe-controls">
        <button
          className="globe-play-btn"
          onClick={handlePlayPause}
          title={isSpinning ? 'Pause' : 'Play'}
        >
          {isSpinning ? '⏸' : '▶'}
        </button>
      </div>

      <div className="portfolio-globe-wrapper">
        <svg ref={svgRef}></svg>

        {tooltip.visible && tooltip.content && (
          <div
            className="portfolio-globe-tooltip"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
            }}
          >
            <div className="tooltip-header">
              <span
                className="tooltip-dot"
                style={{ backgroundColor: getMarkerColor(tooltip.content.type) }}
              />
              <strong>{tooltip.content.title}</strong>
            </div>
            {tooltip.content.subtitle && (
              <div className="tooltip-subtitle">{tooltip.content.subtitle}</div>
            )}
          </div>
        )}
      </div>

      <div className="portfolio-globe-filters">
        <select
          className="globe-filter-select"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          {filterOptions.types.map(type => (
            <option key={type} value={type}>
              {typeLabels[type] || type}
            </option>
          ))}
        </select>

        <select
          className="globe-filter-select"
          value={filters.region}
          onChange={(e) => handleFilterChange('region', e.target.value)}
        >
          <option value="">All Regions</option>
          {filterOptions.regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select
          className="globe-filter-select"
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
        >
          <option value="">All Countries</option>
          {filterOptions.countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            className="globe-filter-clear"
            onClick={clearFilters}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      <div className="portfolio-globe-filter-count">
        Showing {computedFilteredLocations.length} of {globeData?.locations.length || 0} locations
      </div>

      <div className="portfolio-globe-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
          <span>Deployment</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />
          <span>Training</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
          <span>Travel</span>
        </div>
      </div>

      <p className="portfolio-globe-hint">Drag to explore • Click locations for details</p>
    </div>
  );
};

export default PortfolioGlobe;
