export interface GlobeLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'deployment' | 'training' | 'travel';
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  journeyId?: string; // Links location to a journey
}

export interface Journey {
  id: string;
  name: string;
  description?: string;
  date?: string;
  color?: string;
  locations: string[]; // Array of location IDs in order
  images?: string[];
}

export interface GlobeData {
  locations: GlobeLocation[];
  journeys: Journey[];
}
