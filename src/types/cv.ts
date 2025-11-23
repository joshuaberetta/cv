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
  name: string;
  tagline: string;
  location: string;
  email: string | string[];
  phone: string;
  website: string;
  birthdate: string;
  nationality: string;
  photo?: string;
  summary?: string;
  latestVersionUrl?: string;
}

export interface Training {
  event: string;
  year: string;
}

export interface Deployment {
  position: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CVData {
  basics: Basics;
  languages: Language[];
  work: WorkExperience[];
  education: Education[];
  trainings?: Training[];
  deployments?: Deployment[];
  skills?: string[];
}
