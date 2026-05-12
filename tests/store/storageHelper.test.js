import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveCollection, loadCollection } from '../../src/store/storageHelper.js'

/**
 * Unit test suite for 'storageHelper' utility.
 * Focuses on serialization integrity, collection isolation,
 * and resilience against data corruption.
 */
describe('storageHelper.js - Storage Management', () => {

    beforeEach(() => {
        /**
         * Lifecycle Hook: Test Isolation.
         * Ensures idempotency by resetting simulated Web Storage before each case.
         */
        localStorage.clear()
        sessionStorage.clear();
        vi.clearAllMocks()
    })

    it('should correctly serialize and save a song collection', () => {
        const mockSongs = [{ trackId: 1, trackName: 'Test Song' }]

        saveCollection('search_results', mockSongs)

        // Verification: 'search_results' should be persisted in sessionStorage
        const storedData = JSON.parse(sessionStorage.getItem('emusic_data'))

        expect(storedData).toHaveProperty('search_results')
        expect(storedData.search_results[0].trackName).toBe('Test Song')
    })

    it('should return an empty array (fail-safe) if the collection does not exist', () => {
        /**
         * Requirement: Reliability.
         * The utility must return an empty array to prevent runtime crashes
         * when the UI attempts to iterate (map/forEach) over the result.
         */
        const result = loadCollection('non_existent_key');

        expect(result).toEqual([]);
        expect(Array.isArray(result)).toBe(true);
    });

    it('should deserialize and retrieve previously persisted data', () => {
        const mockFavorites = [{ trackId: 99, trackName: 'Favorite' }]

        // Simulation of full cycle: Write -> Read
        saveCollection('favorites', mockFavorites)
        const loaded = loadCollection('favorites')

        expect(loaded).toEqual(mockFavorites)
        expect(loaded[0].trackId).toBe(99)
    })

    it('should guarantee integrity across different storage engines', () => {
        const results = [{ trackId: 1 }]
        const favorites = [{ trackId: 2 }]

        // Test partitioned storage logic
        saveCollection('search_results', results) // Routes to sessionStorage
        saveCollection('favorites', favorites)   // Routes to localStorage

        const sessionStore = JSON.parse(sessionStorage.getItem('emusic_data'))
        const localStore = JSON.parse(localStorage.getItem('emusic_data'))

        expect(sessionStore).toHaveProperty('search_results')
        expect(localStore).toHaveProperty('favorites')
    })

    it('should handle JSON parsing errors gracefully (Robustness)', () => {
        /**
         * Simulation of data corruption on the specific engine used for search_results.
         * The utility must catch the SyntaxError and return the fallback [].
         */
        const STORAGE_KEY = 'emusic_data';

        // Corrupt the engine that 'search_results' targets
        sessionStorage.setItem(STORAGE_KEY, 'invalid-json-{');

        const result = loadCollection('search_results');

        // Validation of recovery behavior to prevent app-wide crashes
        expect(result).toEqual([]);
    });

    it('should preserve existing collections in the same engine when saving a new one', () => {
        const playlistA = [{ id: 1, name: 'Rock' }];
        const playlistB = [{ id: 2, name: 'Jazz' }];

        // Both 'playlists' and 'favorites' route to localStorage
        saveCollection('playlists', playlistA);
        saveCollection('favorites', playlistB);

        const loadedA = loadCollection('playlists');
        const loadedB = loadCollection('favorites');

        expect(loadedA).toEqual(playlistA);
        expect(loadedB).toEqual(playlistB);

        // Final check on the raw string to ensure both keys exist in the same JSON object
        const raw = JSON.parse(localStorage.getItem('emusic_data'));
        expect(raw).toHaveProperty('playlists');
        expect(raw).toHaveProperty('favorites');
    });

    it('should handle saving null or undefined gracefully', () => {
        saveCollection('playlists', null);
        const result = loadCollection('playlists');

        expect(result).toEqual([]);
    });

    it('should NOT persist session data to local storage', () => {
        const results = [{ trackId: 1 }];
        saveCollection('search_results', results);

        expect(sessionStorage.getItem('emusic_data')).not.toBeNull();
        expect(localStorage.getItem('emusic_data')).toBeNull();
    });

    it('should not throw an error if the storage engine is full', () => {
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('QuotaExceededError');
        });

        // This should not throw because of our new try/catch
        expect(() => saveCollection('test', [1, 2, 3])).not.toThrow();
    });
})