import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveCollection, loadCollection } from '../../src/store/storageHelper.js'

/**
 * Suite de tests unitaires pour l'utilitaire 'storageHelper'.
 * Focalisé sur l'intégrité de la sérialisation, l'isolation des collections
 * et la résilience face à la corruption de données.
 */
describe('storageHelper.js - Gestion du LocalStorage', () => {

    beforeEach(() => {
        /**
         * Hook de cycle de vie : Isolation des tests.
         * Garantit l'idempotence en réinitialisant le Web Storage simulé avant chaque cas.
         */
        localStorage.clear()
        sessionStorage.clear();
        vi.clearAllMocks()
    })

    it('devrait sérialiser et sauvegarder une collection de chansons correctement', () => {
        const mockSongs = [{ trackId: 1, trackName: 'Test Song' }]

        saveCollection('search_results', mockSongs)

        // FIX: 'search_results' is now in sessionStorage
        const storedData = JSON.parse(sessionStorage.getItem('emusic_data'))

        expect(storedData).toHaveProperty('search_results')
        expect(storedData.search_results[0].trackName).toBe('Test Song')
    })

    it('devrait retourner un tableau vide (fail-safe) si la collection n’existe pas', () => {
        /**
         * Requirement: Reliability.
         * The utility must return an empty array to prevent runtime crashes
         * when the UI attempts to iterate over the result.
         */
        const result = loadCollection('non_existent_key');

        expect(result).toEqual([]); // Validate it is an empty array
        expect(Array.isArray(result)).toBe(true); // Explicit type check
    });

    it('devrait désérialiser et récupérer les données précédemment persistées', () => {
        const mockFavorites = [{ trackId: 99, trackName: 'Favorite' }]

        // Simulation du cycle complet : Écriture -> Lecture
        saveCollection('favorites', mockFavorites)
        const loaded = loadCollection('favorites')

        expect(loaded).toEqual(mockFavorites)
        expect(loaded[0].trackId).toBe(99)
    })

    it('devrait garantir l\'intégrité des collections sur des moteurs différents', () => {
        const results = [{ trackId: 1 }]
        const favorites = [{ trackId: 2 }]

        saveCollection('search_results', results) // sessionStorage
        saveCollection('favorites', favorites)   // localStorage

        const sessionStore = JSON.parse(sessionStorage.getItem('emusic_data'))
        const localStore = JSON.parse(localStorage.getItem('emusic_data'))

        expect(sessionStore).toHaveProperty('search_results')
        expect(localStore).toHaveProperty('favorites')
    })

    it('devrait gérer les erreurs de parsing JSON de manière gracieuse (Robustesse)', () => {
        /**
         * Simulation of data corruption on the specific engine used for search_results.
         * The utility must catch the SyntaxError and return the fallback [].
         */
        const STORAGE_KEY = 'emusic_data';

        // Corrupt sessionStorage because 'search_results' points there
        sessionStorage.setItem(STORAGE_KEY, 'invalid-json-{');

        const result = loadCollection('search_results');

        expect(result).toEqual([]);
    });
})