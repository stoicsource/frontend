/**
 * Application-wide constants
 */

/**
 * Minimum quality threshold for editions to be displayed in the UI.
 * Editions with quality < this value are filtered out from the edition selector.
 */
export const EDITION_QUALITY_THRESHOLD = 6;

/**
 * Number of chapters to preload before and after the current chapter.
 * A value of 1 means we preload the previous and next chapter.
 */
export const CHAPTER_PADDING = 1;
