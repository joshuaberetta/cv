import React, { useEffect, useRef, useState } from 'react';
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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const timerRef = useRef<d3.Timer | null>(null);

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

      // Draw markers function
      const drawMarkers = () => {
        const filteredLocations = activeFilter
          ? locations.filter(l => l.type === activeFilter)
          : locations;

        const markers = markerGroup.selectAll<SVGCircleElement, GlobeLocation>('circle')
          .data(filteredLocations, d => `${d.name}-${d.country}`);

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
  }, [isSpinning, activeFilter]);

  const handlePlayPause = () => {
    if (isSpinning && timerRef.current) {
      timerRef.current.stop();
    }
    setIsSpinning(!isSpinning);
  };

  const filterTypes = [
    { key: null, label: 'All', color: '#6b7280' },
    { key: 'deployment', label: 'Deployments', color: '#ef4444' },
    { key: 'training', label: 'Trainings', color: '#3b82f6' },
    { key: 'education', label: 'Education', color: '#8b5cf6' },
    { key: 'travel', label: 'Travel', color: '#10b981' },
  ];

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
        {filterTypes.map(({ key, label, color }) => (
          <button
            key={label}
            className={`legend-item ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            <span className="legend-dot" style={{ backgroundColor: color }} />
            <span className="legend-label">{label}</span>
          </button>
        ))}
      </div>

      <p className="globe-hint">Drag to rotate • Click a point for details</p>
    </div>
  );
};

export default SpinningGlobe;
