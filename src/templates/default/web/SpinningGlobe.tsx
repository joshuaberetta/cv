import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface GlobeLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'deployment' | 'training' | 'education' | 'travel';
  details: string;
}

interface GlobeData {
  locations: GlobeLocation[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  location: GlobeLocation | null;
}

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

const SpinningGlobe: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    location: null
  });
  const [isSpinning, setIsSpinning] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    country: '',
    region: ''
  });
  const [allLocations, setAllLocations] = useState<GlobeLocation[]>([]);
  const timerRef = useRef<d3.Timer | null>(null);

  // Derive unique filter options from locations
  const filterOptions = useMemo(() => {
    const types = ['', ...new Set(allLocations.map(l => l.type))];
    const countries = ['', ...new Set(allLocations.map(l => l.country))].sort();
    const regions = ['', ...new Set(allLocations.map(l => getRegion(l.country)))].sort();
    return { types, countries, regions };
  }, [allLocations]);

  // Apply filters to locations
  const filteredLocations = useMemo(() => {
    return allLocations.filter(location => {
      if (filters.type && location.type !== filters.type) return false;
      if (filters.country && location.country !== filters.country) return false;
      if (filters.region && getRegion(location.country) !== filters.region) return false;
      return true;
    });
  }, [allLocations, filters]);

  const handleFilterChange = (filterKey: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'home': return '#f59e0b';
      case 'deployment': return '#ef4444';
      case 'training': return '#3b82f6';
      case 'education': return '#8b5cf6';
      case 'travel': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getMarkerSize = (type: string): number => {
    switch (type) {
      case 'home': return 6;
      case 'deployment': return 5;
      case 'training': return 4;
      case 'education': return 4;
      case 'travel': return 3;
      default: return 3;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = width; // Keep it square

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Clear previous content
    svg.selectAll('*').remove();

    const projection = d3.geoOrthographic()
      .translate([width / 2, height / 2])
      .scale(width / 2.2)
      .clipAngle(90);

    const path = d3.geoPath().projection(projection);
    const center: [number, number] = [width / 2, height / 2];

    // Add ocean/globe background
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', projection.scale())
      .attr('class', 'globe-ocean');

    // Graticule (grid lines)
    const graticule = d3.geoGraticule().step([15, 15]);
    svg.append('path')
      .datum(graticule())
      .attr('class', 'globe-graticule')
      .attr('d', path as any);

    // Countries group
    const countriesGroup = svg.append('g').attr('class', 'countries');

    // Markers group (will be on top)
    const markerGroup = svg.append('g').attr('class', 'markers');

    let locations: GlobeLocation[] = [];

    const config = {
      speed: 0.008,
      verticalTilt: -15,
      horizontalTilt: 0
    };

    // Load data
    Promise.all([
      d3.json('/data/world-110m.json'),
      d3.json('/data/globe-locations.json') as Promise<GlobeData>
    ]).then(([worldData, locationData]) => {
      if (!worldData || !locationData) return;

      // Draw countries
      const countries = topojson.feature(worldData as any, (worldData as any).objects.countries);
      countriesGroup.selectAll('.country')
        .data((countries as any).features)
        .enter()
        .append('path')
        .attr('class', 'globe-country')
        .attr('d', path as any);

      locations = locationData.locations;
      setAllLocations(locations);

      // Draw markers function
      const drawMarkers = () => {
        const locationsToShow = filteredLocations.length > 0 || Object.values(filters).some(v => v)
          ? filteredLocations
          : locations;

        const markers = markerGroup.selectAll<SVGCircleElement, GlobeLocation>('circle')
          .data(locationsToShow, d => `${d.name}-${d.country}`);

        markers.exit().remove();

        markers.enter()
          .append('circle')
          .attr('class', 'globe-marker')
          .merge(markers)
          .attr('cx', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[0] : 0;
          })
          .attr('cy', d => {
            const coords = projection([d.longitude, d.latitude]);
            return coords ? coords[1] : 0;
          })
          .attr('r', d => getMarkerSize(d.type))
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
            return gdistance > Math.PI / 2 ? 'none' : 'white';
          })
          .attr('stroke-width', 1.5)
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
              .attr('r', getMarkerSize(d.type) * 1.8);

            const rect = container.getBoundingClientRect();
            setTooltip({
              visible: true,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              location: d
            });
          })
          .on('mouseleave', function(_, d) {
            d3.select(this)
              .transition()
              .duration(150)
              .attr('r', getMarkerSize(d.type));
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
              setIsSpinning(false);
            }

            const currentRotation = projection.rotate();
            const targetRotation: [number, number, number] = [-d.longitude, -d.latitude, 0];
            d3.transition()
              .duration(1000)
              .tween('rotate', () => {
                const interpolate = d3.interpolate(currentRotation, targetRotation);
                return (t) => {
                  projection.rotate(interpolate(t) as [number, number, number]);
                  svg.selectAll('.globe-country').attr('d', path as any);
                  svg.selectAll('.globe-graticule').attr('d', path as any);
                  drawMarkers();
                };
              });
          });
      };

      // Update paths and markers on rotation
      const updateGlobe = () => {
        svg.selectAll('.globe-country').attr('d', path as any);
        svg.selectAll('.globe-graticule').attr('d', path as any);
        drawMarkers();
      };

      // Initial draw
      drawMarkers();

      // Auto-rotation
      if (isSpinning) {
        timerRef.current = d3.timer((elapsed) => {
          projection.rotate([
            config.speed * elapsed - 120,
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
            setIsSpinning(false);
          }
        })
        .on('drag', (event) => {
          const rotate = projection.rotate();
          const sensitivity = 0.5;
          projection.rotate([
            rotate[0] + event.dx * sensitivity,
            Math.max(-90, Math.min(90, rotate[1] - event.dy * sensitivity)),
            rotate[2]
          ]);
          updateGlobe();
        });

      svg.call(drag);

    }).catch(err => {
      console.error('Error loading globe data:', err);
    });

    // Cleanup
    return () => {
      if (timerRef.current) {
        timerRef.current.stop();
      }
    };
  }, [isSpinning, filters, filteredLocations]);

  const handlePlayPause = () => {
    if (isSpinning && timerRef.current) {
      timerRef.current.stop();
    }
    setIsSpinning(!isSpinning);
  };

  const typeLabels: Record<string, string> = {
    'home': 'Home',
    'deployment': 'Deployment',
    'training': 'Training',
    'education': 'Education',
    'travel': 'Travel',
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="globe-container" ref={containerRef}>
      <div className="globe-header">
        <h3>Where I've Been</h3>
        <button
          className="globe-control-btn"
          onClick={handlePlayPause}
          title={isSpinning ? 'Pause' : 'Play'}
        >
          {isSpinning ? '⏸' : '▶'}
        </button>
      </div>

      <div className="globe-filters">
        <select
          className="globe-filter-select"
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="">All Types</option>
          {filterOptions.types.filter(t => t).map(type => (
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
          {filterOptions.regions.filter(r => r).map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select
          className="globe-filter-select"
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
        >
          <option value="">All Countries</option>
          {filterOptions.countries.filter(c => c).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button
            className="globe-filter-clear"
            onClick={() => setFilters({ type: '', country: '', region: '' })}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      <div className="globe-filter-count">
        Showing {filteredLocations.length} of {allLocations.length} locations
      </div>

      <div className="globe-wrapper">
        <svg ref={svgRef}></svg>

        {tooltip.visible && tooltip.location && (
          <div
            className="globe-tooltip"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
            }}
          >
            <div className="tooltip-header">
              <span
                className="tooltip-type-dot"
                style={{ backgroundColor: getMarkerColor(tooltip.location.type) }}
              />
              <strong>{tooltip.location.name}, {tooltip.location.country}</strong>
            </div>
            <div className="tooltip-details">{tooltip.location.details}</div>
          </div>
        )}
      </div>

      <div className="globe-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }} />
          <span className="legend-label">Home</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
          <span className="legend-label">Deployment</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }} />
          <span className="legend-label">Training</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#8b5cf6' }} />
          <span className="legend-label">Education</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#10b981' }} />
          <span className="legend-label">Travel</span>
        </div>
      </div>

      <p className="globe-hint">Drag to rotate • Click a point for details</p>
    </div>
  );
};

export default SpinningGlobe;
