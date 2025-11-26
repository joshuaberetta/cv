#!/usr/bin/env npx ts-node
/**
 * Build script that compiles markdown content files into globe-data.json
 *
 * Reads markdown files from content/globe/{type}/*.md and index.yaml,
 * parses front matter, and outputs to public/data/globe-data.json
 *
 * Usage:
 *   npx ts-node scripts/build-globe-content.ts
 *   npm run build:content
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface LocationFrontMatter {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  title: string;
  date?: string;
  tags?: string[];
  journeyId?: string;
  language?: string;
}

interface GlobeLocation extends LocationFrontMatter {
  type: 'deployment' | 'training' | 'travel';
  description: string;
}

interface Journey {
  id: string;
  name: string;
  description: string;
  date?: string;
  color: string;
  locations: string[];
}

interface CategoryConfig {
  id: string;
  label: string;
  color: string;
  directory: string;
  order: number;
}

interface IndexConfig {
  categories: CategoryConfig[];
  journeys: Journey[];
}

interface GlobeData {
  locations: GlobeLocation[];
  journeys: Journey[];
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'globe');
const OUTPUT_FILE = path.join(process.cwd(), 'public', 'data', 'globe-data.json');

/**
 * Parse markdown file with YAML front matter
 */
function parseMarkdownFile(filePath: string): { frontMatter: Record<string, any>; content: string } {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Match YAML front matter between --- delimiters
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = fileContent.match(frontMatterRegex);

  if (!match) {
    throw new Error(`No front matter found in ${filePath}`);
  }

  const frontMatter = yaml.load(match[1]) as Record<string, any>;
  const content = match[2].trim();

  return { frontMatter, content };
}

/**
 * Load all markdown files from a directory
 */
function loadMarkdownFiles(directory: string): { frontMatter: Record<string, any>; content: string }[] {
  if (!fs.existsSync(directory)) {
    console.warn(`Directory not found: ${directory}`);
    return [];
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const filePath = path.join(directory, file);
    try {
      return parseMarkdownFile(filePath);
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      throw error;
    }
  });
}

/**
 * Load and parse the index.yaml configuration
 */
function loadIndexConfig(): IndexConfig {
  const indexPath = path.join(CONTENT_DIR, 'index.yaml');

  if (!fs.existsSync(indexPath)) {
    throw new Error(`Index file not found: ${indexPath}`);
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  return yaml.load(content) as IndexConfig;
}

/**
 * Map category ID to location type
 */
function categoryIdToType(categoryId: string): 'deployment' | 'training' | 'travel' {
  const mapping: Record<string, 'deployment' | 'training' | 'travel'> = {
    'deployment': 'deployment',
    'training': 'training',
    'travel': 'travel',
  };
  return mapping[categoryId] || 'travel';
}

/**
 * Main build function
 */
function buildGlobeContent(): void {
  console.log('Building globe content from markdown files...\n');

  // Load configuration
  const config = loadIndexConfig();
  console.log(`Found ${config.categories.length} categories`);

  // Sort categories by order
  const sortedCategories = [...config.categories].sort((a, b) => a.order - b.order);

  // Load locations from each category directory
  const locations: GlobeLocation[] = [];

  for (const category of sortedCategories) {
    const categoryDir = path.join(CONTENT_DIR, category.directory);
    const files = loadMarkdownFiles(categoryDir);

    console.log(`  ${category.label}: ${files.length} entries`);

    for (const { frontMatter, content } of files) {
      const location: GlobeLocation = {
        id: frontMatter.id,
        name: frontMatter.name,
        country: frontMatter.country,
        latitude: frontMatter.latitude,
        longitude: frontMatter.longitude,
        title: frontMatter.title,
        type: categoryIdToType(category.id),
        description: content,
        ...(frontMatter.date && { date: String(frontMatter.date) }),
        ...(frontMatter.tags && { tags: frontMatter.tags }),
        ...(frontMatter.journeyId && { journeyId: frontMatter.journeyId }),
      };

      locations.push(location);
    }
  }

  // Build output data
  const globeData: GlobeData = {
    locations,
    journeys: config.journeys,
  };

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(globeData, null, 2));

  console.log(`\nGenerated ${OUTPUT_FILE}`);
  console.log(`  Total locations: ${locations.length}`);
  console.log(`  Total journeys: ${config.journeys.length}`);
}

// Run if called directly
buildGlobeContent();
