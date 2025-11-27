/**
 * Base interface for all content items parsed from markdown files
 */
export interface ContentItem {
  slug: string;
  section: 'projects' | 'trainings' | 'work' | 'trips';
  name: string;
  body: string;
  order?: number;
}

/**
 * Project content with specific metadata
 */
export interface ProjectContent extends ContentItem {
  section: 'projects';
  url?: string;
  tags: string[];
  description?: string;
  featured?: boolean;
  image?: string;
}

/**
 * Training content with specific metadata
 */
export interface TrainingContent extends ContentItem {
  section: 'trainings';
  organization: string;
  course: string;
  location: string;
  country: string;
  year: string;
  language?: string;
}

/**
 * Work experience content with specific metadata
 */
export interface WorkContent extends ContentItem {
  section: 'work';
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
}

/**
 * Trip/travel content with specific metadata
 */
export interface TripContent extends ContentItem {
  section: 'trips';
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  tags?: string[];
  purpose?: string;
}

/**
 * Union type for all content types
 */
export type Content = ProjectContent | TrainingContent | WorkContent | TripContent;

/**
 * Frontmatter data extracted from markdown files
 */
export interface Frontmatter {
  [key: string]: any;
}

/**
 * Parsed markdown file result
 */
export interface ParsedMarkdown {
  frontmatter: Frontmatter;
  body: string;
}
