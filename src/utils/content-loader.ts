import matter from 'gray-matter';
import { ProjectContent, TrainingContent, WorkContent, ParsedMarkdown } from '../types/content';

/**
 * Parse markdown file content and extract frontmatter
 */
export function parseMarkdown(content: string): ParsedMarkdown {
  const { data, content: body } = matter(content);
  return {
    frontmatter: data,
    body: body.trim()
  };
}

/**
 * Convert parsed markdown to ProjectContent
 */
export function toProjectContent(parsed: ParsedMarkdown, slug: string): ProjectContent {
  const { frontmatter, body } = parsed;
  
  return {
    slug,
    section: 'projects',
    name: frontmatter.name,
    body,
    url: frontmatter.url,
    tags: frontmatter.tags || [],
    description: frontmatter.description,
    featured: frontmatter.featured || false,
    image: frontmatter.image,
    order: frontmatter.order || 999
  };
}

/**
 * Convert parsed markdown to TrainingContent
 */
export function toTrainingContent(parsed: ParsedMarkdown, slug: string): TrainingContent {
  const { frontmatter, body } = parsed;
  
  return {
    slug,
    section: 'trainings',
    name: frontmatter.course || frontmatter.name,
    body,
    organization: frontmatter.organization,
    course: frontmatter.course,
    location: frontmatter.location,
    country: frontmatter.country,
    year: frontmatter.year,
    language: frontmatter.language ? (Array.isArray(frontmatter.language) ? frontmatter.language : [frontmatter.language]) : undefined,
    description: frontmatter.description,
    order: frontmatter.order || 999
  };
}

/**
 * Convert parsed markdown to WorkContent
 */
export function toWorkContent(parsed: ParsedMarkdown, slug: string): WorkContent {
  const { frontmatter, body } = parsed;
  
  return {
    slug,
    section: 'work',
    name: frontmatter.position || frontmatter.name,
    body,
    position: frontmatter.position,
    company: frontmatter.company,
    location: frontmatter.location,
    startDate: frontmatter.startDate,
    endDate: frontmatter.endDate,
    description: frontmatter.description,
    order: frontmatter.order || 999
  };
}

/**
 * Load all markdown files from a directory using Vite's import.meta.glob
 */
export async function loadContentFiles<T>(
  files: Record<string, () => Promise<{ default: string }>>,
  converter: (parsed: ParsedMarkdown, slug: string) => T
): Promise<T[]> {
  const content: T[] = [];
  
  for (const path in files) {
    const module = await files[path]();
    const parsed = parseMarkdown(module.default);
    const filename = path.split('/').pop() || '';
    const slug = filename.replace(/\.md$/, '');
    content.push(converter(parsed, slug));
  }
  
  // Sort by order field
  return content.sort((a: any, b: any) => (a.order || 999) - (b.order || 999));
}
