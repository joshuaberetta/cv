/**
 * CV Data Types
 */

export interface Language {
  language: string;
  fluency?: string;
  skills?: {
    listening: string;
    reading: string;
    writing: string;
    spokenProduction: string;
    spokenInteraction: string;
  };
}

export interface WorkExperience {
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  website: string;
  startDate: string;
  endDate: string;
  level: string;
  description?: string;
}

export interface Basics {
  template?: string;
  name: string;
  tagline: string;
  location: string;
  email: string | string[];
  phone: string;
  phoneUrl?: string;
  website: string;
  birthdate: string;
  nationality: string;
  photo?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  latestVersionUrl?: string;
}

export interface Training {
  organization: string;
  course: string;
  location: string;
  year: string;
  language?: string[];
}

export interface Deployment {
  position: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Volunteer {
  position: string;
  organization: string;
  startDate: string;
  endDate: string;
  summary?: string;
  website?: string;
}

export interface SectionTitles {
  work: string;
  education: string;
  volunteering: string;
  deployments: string;
  trainings: string;
}

export interface CVData {
  basics: Basics;
  sections: SectionTitles;
  languages: Language[];
  work: WorkExperience[];
  education: Education[];
  trainings?: Training[];
  deployments?: Deployment[];
  volunteering?: Volunteer[];
  skills?: string[];
}
