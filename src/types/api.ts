/**
 * API Response Types
 *
 * These interfaces define the shape of data received from the API.
 */

/**
 * Author data as received from the API
 */
export interface AuthorApiResponse {
  id: number;
  name: string;
  shortName: string;
  shortestName: string;
  urlSlug: string;
}

/**
 * Edition data as received from the API
 * Note: The 'author' field is a URL reference that gets resolved separately
 */
export interface EditionApiResponse {
  id: number;
  name: string;
  year: string;
  work_id: string;
  author_id: string;
  quality: number;
  contributor: any; // Could be typed more specifically if needed
  language: string;
  source: string;
  sources: any[]; // Could be typed more specifically if needed
  author: string; // URL reference to author (resolved separately, not assigned)
}

/**
 * Work data as received from the API
 * Note: The 'author' and 'editions' fields are URL references that get resolved separately
 */
export interface WorkApiResponse {
  id: number;
  name: string;
  urlSlug: string;
  author: string; // URL reference to author (resolved separately, not assigned)
  editions: string[]; // Array of URL references (resolved separately, not assigned)
}

/**
 * TOC Entry data as received from the API
 */
export interface TocEntryApiResponse {
  id: number;
  label: string;
  sortOrder: number;
  work: string; // URL reference to work
}

/**
 * Chapter data as received from the API
 */
export interface ChapterApiResponse {
  id: number;
  content: string;
  notes: string;
  notesFormat: string;
  title: string;
  contentType: string;
  tocEntry: string; // URL reference to TOC entry
  edition: string;  // URL reference to edition
}
