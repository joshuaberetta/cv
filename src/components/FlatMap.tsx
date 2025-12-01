import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { GlobeLocation, Journey, GlobeData } from '../types/globe';
import './FlatMap.css';

interface FlatMapProps {
  onLocationSelect: (location: GlobeLocation | null) => void;
  onJourneySelect: (journey: Journey | null) => void;
  activeFilter: string | null;
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

const FlatMap: React.FC<FlatMapProps> = ({
  onLocationSelect,
  onJourneySelect,
  activeFilter,
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
  const [globeData, setGlobeData] = useState<GlobeData | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'deployment': return '#C34681';
      case 'training': return '#3388F8';
      case 'travel': return '#10b981';
      default: return '#6A7A82';
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

  const drawMap = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !globeData) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = Math.min(width * 0.6, 500); // Maintain aspect ratio

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Create a group for zoom/pan transformations
    const g = svg.append('g');

    // Use Equirectangular projection for simple flat map
    const projection = d3.geoEquirectangular()
      .translate([width / 2, height / 2])
      .scale(width / 6.5)
      .center([0, 10]); // Center slightly north to show more land

    const path = d3.geoPath().projection(projection);

    // Calculate map bounds for panning constraints
    const mapWidth = width;
    const mapHeight = height;

    // Setup zoom behavior with constrained panning
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8]) // Allow zoom from 1x to 8x
      .translateExtent([
        [-mapWidth * 0.5, -mapHeight * 0.5], 
        [mapWidth * 1.5, mapHeight * 1.5]
      ]) // Keep at least half the map visible
      .on('zoom', (event) => {
        const transform = event.transform;
        g.attr('transform', transform);
        
        // Counter-scale markers to keep them constant size
        const scale = transform.k;
        
        // Update marker sizes - counter scale the radius
        markerGroup.selectAll('circle')
          .each(function(this: any) {
            const circle = d3.select(this);
            const baseRadius = parseFloat(circle.attr('data-base-radius') || '5');
            const isHovering = circle.classed('hovering');
            
            if (!isHovering) {
              circle.attr('r', baseRadius / scale);
            } else {
              circle.attr('r', (baseRadius * 1.3) / scale);
            }
          });
      });

    zoomRef.current = zoom;

    // Apply zoom to SVG
    svg.call(zoom);

    // Defs for glow effect
    const defs = g.append('defs');

    const glowFilter = defs.append('filter')
      .attr('id', 'flat-map-glow')
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

    // Map background
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'flat-map-ocean');

    // Graticule
    const graticule = d3.geoGraticule().step([20, 20]);
    g.append('path')
      .datum(graticule())
      .attr('class', 'flat-map-graticule')
      .attr('d', path as any)
      .style('vector-effect', 'non-scaling-stroke');

    // Countries group
    const countriesGroup = g.append('g').attr('class', 'countries');

    // Journey lines group (below markers)
    const journeyGroup = g.append('g').attr('class', 'journeys');

    // Markers group
    const markerGroup = g.append('g').attr('class', 'markers');

    // Load world data
    d3.json('/data/world-110m.json').then((worldData: any) => {
      if (!worldData) return;

      const countries = topojson.feature(worldData, worldData.objects.countries);
      
      // Filter locations
      const filteredLocations = activeFilter
        ? globeData.locations.filter(l => l.type === activeFilter)
        : globeData.locations;

      countriesGroup.selectAll('.country')
        .data((countries as any).features)
        .enter()
        .append('path')
        .attr('class', (d: any) => {
          // Check if any marker falls within this country's boundaries
          const hasMarker = filteredLocations.some(loc => {
            const point: [number, number] = [loc.longitude, loc.latitude];
            // Use d3.geoContains to check if the point is within the country polygon
            return d3.geoContains(d, point);
          });
          return hasMarker ? 'flat-map-country flat-map-country-highlighted' : 'flat-map-country';
        })
        .attr('d', path as any)
        .style('vector-effect', 'non-scaling-stroke');

      // Get journeys to display
      const visibleJourneys = activeFilter === 'travel' || !activeFilter
        ? globeData.journeys
        : [];

      // Draw journey lines
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

          // Create line path
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
          const baseWidth = isJourneySelected ? 3 : 2;

          journeyGroup.append('path')
            .datum(lineFeature)
            .attr('d', lineGenerator as any)
            .attr('class', 'journey-line')
            .attr('stroke', journey.color || '#10b981')
            .attr('stroke-width', baseWidth)
            .attr('data-base-width', baseWidth)
            .attr('stroke-opacity', isJourneySelected ? 1 : 0.6)
            .attr('fill', 'none')
            .attr('stroke-dasharray', '4,2')
            .style('cursor', 'pointer')
            .style('filter', isJourneySelected ? 'url(#flat-map-glow)' : 'none')
            .style('vector-effect', 'non-scaling-stroke')
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

      // Draw markers
      filteredLocations.forEach(location => {
        const coordinate: [number, number] = [location.longitude, location.latitude];
        const projected = projection(coordinate);
        
        if (!projected) return;

        const isSelected = selectedLocation?.id === location.id;
        const baseRadius = getMarkerSize(location.type, isSelected);

        markerGroup.append('circle')
          .attr('cx', projected[0])
          .attr('cy', projected[1])
          .attr('r', baseRadius)
          .attr('data-base-radius', baseRadius)
          .attr('class', 'flat-map-marker')
          .attr('fill', getMarkerColor(location.type))
          .attr('stroke', '#fff')
          .attr('stroke-width', isSelected ? 2 : 1)
          .style('cursor', 'pointer')
          .style('filter', isSelected ? 'url(#flat-map-glow)' : 'none')
          .style('vector-effect', 'non-scaling-stroke')
          .on('mouseenter', function(event) {
            const currentScale = d3.zoomTransform(svgRef.current!).k;
            const storedBaseRadius = parseFloat(d3.select(this).attr('data-base-radius') || '5');
            
            d3.select(this)
              .classed('hovering', true)
              .transition()
              .duration(150)
              .attr('r', (storedBaseRadius * 1.3) / currentScale);

            const rect = container.getBoundingClientRect();
            setTooltip({
              visible: true,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
              content: {
                title: location.title || location.name,
                subtitle: location.country + (location.date ? ` • ${location.date}` : ''),
                type: location.type
              }
            });
          })
          .on('mouseleave', function() {
            const currentScale = d3.zoomTransform(svgRef.current!).k;
            const storedBaseRadius = parseFloat(d3.select(this).attr('data-base-radius') || '5');
            
            d3.select(this)
              .classed('hovering', false)
              .transition()
              .duration(150)
              .attr('r', storedBaseRadius / currentScale);
            setTooltip(prev => ({ ...prev, visible: false }));
          })
          .on('click', function(event) {
            event.stopPropagation();
            setTooltip(prev => ({ ...prev, visible: false }));
            onLocationSelect(location);
          });
      });
    }).catch(err => console.error('Error loading world data:', err));

  }, [globeData, activeFilter, selectedLocation, selectedJourney, onLocationSelect, onJourneySelect]);

  useEffect(() => {
    drawMap();
    
    const handleResize = () => drawMap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMap]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 1.5);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomRef.current.scaleBy, 0.67);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  return (
    <div ref={containerRef} className="flat-map-container">
      <div className="flat-map-controls">
        <button 
          className="map-control-btn" 
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button 
          className="map-control-btn" 
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button 
          className="map-control-btn" 
          onClick={handleResetZoom}
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
      <svg 
        ref={svgRef} 
        className="flat-map-svg" 
        onClick={() => {
          onLocationSelect(null);
          onJourneySelect(null);
        }}
        style={{ cursor: 'grab' }}
      />
      {tooltip.visible && tooltip.content && (
        <div
          className="flat-map-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
          }}
        >
          <div className="tooltip-title">{tooltip.content.title}</div>
          {tooltip.content.subtitle && (
            <div className="tooltip-subtitle">{tooltip.content.subtitle}</div>
          )}
          <div className="tooltip-type">{tooltip.content.type}</div>
        </div>
      )}
    </div>
  );
};

export default FlatMap;
