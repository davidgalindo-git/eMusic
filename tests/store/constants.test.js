import { describe, it, expect } from 'vitest';
import { DEFAULT_COLLECTION } from '../../src/store/constants.js';

/**
 * DEFAULT_COLLECTION Immutable Schema Validation
 *
 * ensures the synthetic 'Featured' collection maintains referential
 * integrity and adheres to the playback engine's data contract.
 */
describe('DEFAULT_COLLECTION Schema Integrity', () => {

    it('should contain exactly 8 featured tracks', () => {
        expect(DEFAULT_COLLECTION).toHaveLength(8);
    });

    it('should have unique track IDs for all entries', () => {
        // Prevents UI key collisions and player logic errors
        const ids = DEFAULT_COLLECTION.map(song => song.trackId);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should conform to the normalized song schema', () => {
        DEFAULT_COLLECTION.forEach(song => {
            expect(song).toHaveProperty('trackId');
            expect(song).toHaveProperty('trackName');
            expect(song).toHaveProperty('artistName');
            expect(song).toHaveProperty('previewUrl');
            expect(song).toHaveProperty('artworkUrl');

            // Data Type Assertions
            expect(typeof song.trackId).toBe('number');
            expect(typeof song.trackName).toBe('string');
            expect(typeof song.artistName).toBe('string');
        });
    });

    it('should enforce strict HTTPS URL presence for all media assets', () => {
        /**
         * Validates that every song possesses valid HTTPS endpoints
         * for both audio (.m4a) and visual assets.
         */
        DEFAULT_COLLECTION.forEach(song => {
            // Assert non-empty strings
            expect(song.previewUrl.length).toBeGreaterThan(0);
            expect(song.artworkUrl.length).toBeGreaterThan(0);

            // Assert protocol security and format
            expect(song.previewUrl).toMatch(/^https:\/\/.*\.m4a$/);
            expect(song.artworkUrl).toContain('https://');
        });
    });
});