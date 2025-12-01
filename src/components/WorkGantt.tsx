import React from 'react';
import { WorkExperience, Volunteer } from '../types/cv';
import { WorkContent } from '../types/content';
import './WorkGantt.css';

interface WorkGanttProps {
  work: (WorkExperience | WorkContent)[];
  volunteering?: Volunteer[];
  onItemClick?: (item: WorkExperience | WorkContent | Volunteer, type: 'work' | 'volunteer') => void;
}

interface GanttItem {
  data: WorkExperience | WorkContent | Volunteer;
  type: 'work' | 'volunteer';
  position: string;
  organization: string;
  startDate: Date;
  endDate: Date | null; // null means "Current"
  startDateStr: string;
  endDateStr: string;
}

const WorkGantt: React.FC<WorkGanttProps> = ({ work, volunteering = [], onItemClick }) => {
  // Parse date string (MM/YYYY or YYYY format)
  const parseDate = (dateStr: string): Date => {
    if (dateStr.toLowerCase() === 'current') {
      return new Date();
    }
    const parts = dateStr.split('/');
    if (parts.length === 2) {
      // MM/YYYY format
      const month = parseInt(parts[0]) - 1;
      const year = parseInt(parts[1]);
      return new Date(year, month, 1);
    } else {
      // YYYY format
      const year = parseInt(parts[0]);
      return new Date(year, 0, 1);
    }
  };

  // Convert to Gantt items
  const workItems: GanttItem[] = work.map(job => ({
    data: job,
    type: 'work' as const,
    position: job.position,
    organization: job.company,
    startDate: parseDate(job.startDate),
    endDate: job.endDate.toLowerCase() === 'current' ? null : parseDate(job.endDate),
    startDateStr: job.startDate,
    endDateStr: job.endDate
  }));

  const volunteerItems: GanttItem[] = volunteering.map(vol => ({
    data: vol,
    type: 'volunteer' as const,
    position: vol.position,
    organization: vol.organization,
    startDate: parseDate(vol.startDate),
    endDate: vol.endDate.toLowerCase() === 'current' ? null : parseDate(vol.endDate),
    startDateStr: vol.startDate,
    endDateStr: vol.endDate
  }));

  // Combine and sort by start date (most recent first)
  const allItems = [...workItems, ...volunteerItems].sort((a, b) => 
    b.startDate.getTime() - a.startDate.getTime()
  );

  // Group items by organization
  const groupedWorkItems = workItems.reduce((acc, item) => {
    const org = item.organization;
    if (!acc[org]) {
      acc[org] = [];
    }
    acc[org].push(item);
    return acc;
  }, {} as Record<string, GanttItem[]>);

  const groupedVolunteerItems = volunteerItems.reduce((acc, item) => {
    const org = item.organization;
    if (!acc[org]) {
      acc[org] = [];
    }
    acc[org].push(item);
    return acc;
  }, {} as Record<string, GanttItem[]>);

  // Sort organizations by most recent position start date
  const sortedWorkOrgs = Object.keys(groupedWorkItems).sort((a, b) => {
    const aLatest = Math.max(...groupedWorkItems[a].map(item => item.startDate.getTime()));
    const bLatest = Math.max(...groupedWorkItems[b].map(item => item.startDate.getTime()));
    return bLatest - aLatest;
  });

  const sortedVolunteerOrgs = Object.keys(groupedVolunteerItems).sort((a, b) => {
    const aLatest = Math.max(...groupedVolunteerItems[a].map(item => item.startDate.getTime()));
    const bLatest = Math.max(...groupedVolunteerItems[b].map(item => item.startDate.getTime()));
    return bLatest - aLatest;
  });

  if (allItems.length === 0) return null;

  // Calculate timeline range
  const now = new Date();
  const earliestDate = new Date(Math.min(...allItems.map(item => item.startDate.getTime())));
  const latestDate = now;

  // Generate year/month markers for the timeline
  const generateTimeMarkers = () => {
    const markers: { year: number; month?: number; label: string; date: Date }[] = [];
    const start = new Date(earliestDate.getFullYear(), 0, 1);
    const end = new Date(latestDate.getFullYear(), 11, 31);
    
    let current = new Date(end); // Start from latest year
    while (current >= start) {
      markers.push({
        year: current.getFullYear(),
        label: current.getFullYear().toString(),
        date: new Date(current)
      });
      current.setFullYear(current.getFullYear() - 1); // Go backwards
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();
  const totalDays = (latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24);

  // Calculate position and width for each item
  // Account for padding by using 95% of the available space (leaving 2.5% on each side for padding)
  const calculateBarStyle = (item: GanttItem) => {
    const start = item.startDate.getTime();
    const end = item.endDate ? item.endDate.getTime() : now.getTime();
    
    // Reverse: left side is current, right side is earliest
    // Scale to 95% to account for padding
    const leftOffset = 2.5 + (((latestDate.getTime() - end) / (1000 * 60 * 60 * 24)) / totalDays * 95);
    const width = ((end - start) / (1000 * 60 * 60 * 24)) / totalDays * 95;
    
    return {
      left: `${leftOffset}%`,
      width: `${Math.max(width, 0.5)}%` // Minimum width for visibility
    };
  };

  // Format date for display
  const formatDateShort = (date: Date): string => {
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Calculate duration
  const calculateDuration = (start: Date, end: Date | null): string => {
    const endDate = end || now;
    const months = Math.floor((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
    }
    return `${months}m`;
  };

  const handleItemClick = (item: GanttItem) => {
    if (onItemClick) {
      onItemClick(item.data, item.type);
    }
  };

  return (
    <div className="work-gantt">
      <div className="work-gantt-inner">
        {/* Header with timeline */}
        <div className="gantt-header">
        <div className="gantt-left-column">
          <div className="column-title">Position</div>
        </div>
        <div className="gantt-timeline-column">
          <div className="timeline-markers">
            {timeMarkers.map((marker, idx) => {
              // Reverse: left side is current, right side is earliest
              // Scale to 95% to account for padding
              const position = 2.5 + (((latestDate.getTime() - marker.date.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 95);
              return (
                <div
                  key={idx}
                  className="timeline-marker"
                  style={{ left: `${position}%` }}
                >
                  <span className="marker-label">{marker.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="gantt-body">
        {/* Work section */}
        {workItems.length > 0 && (
          <>
            <div className="gantt-section-divider">
              <span className="section-label">Work</span>
            </div>
            {sortedWorkOrgs.map((org) => (
              <React.Fragment key={`org-${org}`}>
                <div className="gantt-org-group">
                  <div className="org-group-header">{org}</div>
                  {groupedWorkItems[org]
                    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
                    .map((item, idx) => (
                      <div key={`work-${org}-${idx}`} className="gantt-row" onClick={() => handleItemClick(item)}>
                        <div className="gantt-left-column">
                          <div className="row-title">{item.position}</div>
                          <div className="row-subtitle">{item.organization}</div>
                        </div>
                        <div className="gantt-timeline-column">
                          <div className="gantt-bar-container">
                            <div
                              className="gantt-bar work-bar"
                              style={calculateBarStyle(item)}
                            >
                              <div className="bar-tooltip">
                                <div className="tooltip-title">{item.position}</div>
                                <div className="tooltip-org">{item.organization}</div>
                                <div className="tooltip-dates">
                                  {formatDateShort(item.startDate)} - {item.endDate ? formatDateShort(item.endDate) : 'Present'}
                                </div>
                                <div className="tooltip-duration">{calculateDuration(item.startDate, item.endDate)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </React.Fragment>
            ))}
          </>
        )}

        {/* Volunteering section */}
        {volunteerItems.length > 0 && (
          <>
            <div className="gantt-section-divider volunteer-divider">
              <span className="section-label">Volunteering</span>
            </div>
            {sortedVolunteerOrgs.map((org) => (
              <React.Fragment key={`volunteer-org-${org}`}>
                <div className="gantt-org-group">
                  <div className="org-group-header volunteer-org">{org}</div>
                  {groupedVolunteerItems[org]
                    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
                    .map((item, idx) => (
                      <div key={`volunteer-${org}-${idx}`} className="gantt-row" onClick={() => handleItemClick(item)}>
                        <div className="gantt-left-column">
                          <div className="row-title">{item.position}</div>
                          <div className="row-subtitle">{item.organization}</div>
                        </div>
                        <div className="gantt-timeline-column">
                          <div className="gantt-bar-container">
                            <div
                              className="gantt-bar volunteer-bar"
                              style={calculateBarStyle(item)}
                            >
                              <div className="bar-tooltip">
                                <div className="tooltip-title">{item.position}</div>
                                <div className="tooltip-org">{item.organization}</div>
                                <div className="tooltip-dates">
                                  {formatDateShort(item.startDate)} - {item.endDate ? formatDateShort(item.endDate) : 'Present'}
                                </div>
                                <div className="tooltip-duration">{calculateDuration(item.startDate, item.endDate)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default WorkGantt;
