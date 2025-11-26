#!/usr/bin/env npx ts-node
/**
 * Bulk Geocoding Utility using Google Places API
 *
 * This script takes a list of locations (cities, countries, or addresses) and
 * returns their latitude/longitude coordinates using the Google Places API.
 *
 * Usage:
 *   npx ts-node scripts/geocode.ts --input locations.json --output geocoded.json
 *   npx ts-node scripts/geocode.ts --places "Cape Town, South Africa" "New York, USA"
 *
 * Environment Variables:
 *   GOOGLE_PLACES_API_KEY - Your Google Places API key
 *
 * Input JSON format:
 *   { "locations": ["Cape Town, South Africa", "New York, USA"] }
 *   or
 *   { "locations": [{ "name": "Cape Town", "country": "South Africa" }] }
 *
 * Output JSON format:
 *   {
 *     "results": [
 *       {
 *         "query": "Cape Town, South Africa",
 *         "name": "Cape Town",
 *         "country": "South Africa",
 *         "latitude": -33.9249,
 *         "longitude": 18.4241,
 *         "formattedAddress": "Cape Town, South Africa",
 *         "placeId": "ChIJ1-4miA9QzB0Rh6ooKPzhf2g"
 *       }
 *     ],
 *     "errors": []
 *   }
 */

import * as fs from 'fs';
import * as path from 'path';

interface LocationInput {
  name?: string;
  country?: string;
  query?: string;
}

interface GeocodedResult {
  query: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

interface GeocodingError {
  query: string;
  error: string;
}

interface GeocodingOutput {
  results: GeocodedResult[];
  errors: GeocodingError[];
}

interface GooglePlacesResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
    place_id: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
  error_message?: string;
}

const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

async function geocodeLocation(query: string, apiKey: string): Promise<GeocodedResult> {
  const url = new URL(GOOGLE_PLACES_API_URL);
  url.searchParams.set('address', query);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  const data: GooglePlacesResponse = await response.json();

  if (data.status !== 'OK') {
    throw new Error(data.error_message || `Geocoding failed with status: ${data.status}`);
  }

  if (data.results.length === 0) {
    throw new Error('No results found');
  }

  const result = data.results[0];

  // Extract country from address components
  const countryComponent = result.address_components.find(
    comp => comp.types.includes('country')
  );

  // Extract city/locality from address components
  const localityComponent = result.address_components.find(
    comp => comp.types.includes('locality') || comp.types.includes('administrative_area_level_1')
  );

  return {
    query,
    name: localityComponent?.long_name || query.split(',')[0].trim(),
    country: countryComponent?.long_name || '',
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    placeId: result.place_id,
  };
}

async function bulkGeocode(
  locations: (string | LocationInput)[],
  apiKey: string,
  delayMs: number = 200
): Promise<GeocodingOutput> {
  const results: GeocodedResult[] = [];
  const errors: GeocodingError[] = [];

  for (let i = 0; i < locations.length; i++) {
    const location = locations[i];
    let query: string;

    if (typeof location === 'string') {
      query = location;
    } else if (location.query) {
      query = location.query;
    } else if (location.name && location.country) {
      query = `${location.name}, ${location.country}`;
    } else if (location.name) {
      query = location.name;
    } else {
      errors.push({ query: JSON.stringify(location), error: 'Invalid location format' });
      continue;
    }

    console.log(`[${i + 1}/${locations.length}] Geocoding: ${query}`);

    try {
      const result = await geocodeLocation(query, apiKey);
      results.push(result);
      console.log(`  -> Found: ${result.latitude}, ${result.longitude}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ query, error: errorMessage });
      console.error(`  -> Error: ${errorMessage}`);
    }

    // Add delay between requests to avoid rate limiting
    if (i < locations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { results, errors };
}

function parseArgs(args: string[]): {
  input?: string;
  output?: string;
  places?: string[];
  delay?: number;
  help?: boolean;
} {
  const result: {
    input?: string;
    output?: string;
    places?: string[];
    delay?: number;
    help?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        result.input = args[++i];
        break;
      case '--output':
      case '-o':
        result.output = args[++i];
        break;
      case '--places':
      case '-p':
        result.places = [];
        while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.places.push(args[++i]);
        }
        break;
      case '--delay':
      case '-d':
        result.delay = parseInt(args[++i], 10);
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

function printUsage(): void {
  console.log(`
Bulk Geocoding Utility using Google Places API

Usage:
  npx ts-node scripts/geocode.ts [options]

Options:
  -i, --input <file>      Input JSON file with locations to geocode
  -o, --output <file>     Output JSON file for geocoded results (default: stdout)
  -p, --places <places>   Space-separated list of places to geocode
  -d, --delay <ms>        Delay between API requests in ms (default: 200)
  -h, --help              Show this help message

Environment Variables:
  GOOGLE_PLACES_API_KEY   Your Google Places API key (required)

Examples:
  # Geocode from command line
  npx ts-node scripts/geocode.ts -p "Paris, France" "Tokyo, Japan"

  # Geocode from input file
  npx ts-node scripts/geocode.ts -i locations.json -o geocoded.json

Input JSON format:
  { "locations": ["Cape Town, South Africa", "New York, USA"] }
  or
  { "locations": [{ "name": "Cape Town", "country": "South Africa" }] }
`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error('Error: GOOGLE_PLACES_API_KEY environment variable is required');
    console.error('Get an API key at: https://console.cloud.google.com/apis/credentials');
    process.exit(1);
  }

  let locations: (string | LocationInput)[] = [];

  // Get locations from input file
  if (args.input) {
    const inputPath = path.resolve(args.input);
    if (!fs.existsSync(inputPath)) {
      console.error(`Error: Input file not found: ${inputPath}`);
      process.exit(1);
    }
    const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    locations = inputData.locations || inputData;
  }

  // Get locations from command line
  if (args.places && args.places.length > 0) {
    locations = [...locations, ...args.places];
  }

  if (locations.length === 0) {
    console.error('Error: No locations provided. Use --input or --places');
    printUsage();
    process.exit(1);
  }

  console.log(`\nGeocoding ${locations.length} location(s)...\n`);

  const output = await bulkGeocode(locations, apiKey, args.delay || 200);

  console.log(`\nCompleted: ${output.results.length} successful, ${output.errors.length} errors`);

  // Output results
  const outputJson = JSON.stringify(output, null, 2);

  if (args.output) {
    const outputPath = path.resolve(args.output);
    fs.writeFileSync(outputPath, outputJson);
    console.log(`\nResults written to: ${outputPath}`);
  } else {
    console.log('\nResults:\n');
    console.log(outputJson);
  }
}

// Export for programmatic use
export { geocodeLocation, bulkGeocode, GeocodedResult, GeocodingOutput, LocationInput };

// Run if called directly
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
