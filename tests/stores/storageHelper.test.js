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
        vi.clearAllMocks()
    })

    it('devrait sérialiser et sauvegarder une collection de chansons correctement', () => {
        const mockSongs = [
            { trackId: 1, trackName: 'Test Song' },
            { trackId: 2, trackName: 'Another Song' }
        ]

        saveCollection('search_results', mockSongs)

        // Vérification de la structure de l'objet racine 'emusic_data'
        const storedData = JSON.parse(localStorage.getItem('emusic_data'))

        expect(storedData).toHaveProperty('search_results')
        expect(storedData.search_results).toHaveLength(2)
        expect(storedData.search_results[0].trackName).toBe('Test Song')
    })

    it('devrait retourner un tableau vide (fail-safe) si la collection n’existe pas', () => {
        // Validation de la valeur par défaut pour éviter les erreurs de type undefined dans l'UI
        const result = loadCollection('non_existent_key')

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
    })

    it('devrait désérialiser et récupérer les données précédemment persistées', () => {
        const mockFavorites = [{ trackId: 99, trackName: 'Favorite' }]

        // Simulation du cycle complet : Écriture -> Lecture
        saveCollection('favorites', mockFavorites)
        const loaded = loadCollection('favorites')

        expect(loaded).toEqual(mockFavorites)
        expect(loaded[0].trackId).toBe(99)
    })

    it('devrait garantir l\'intégrité des collections multiples (Atomicité)', () => {
        const results = [{ trackId: 1 }]
        const favorites = [{ trackId: 2 }]

        // Vérifie que la mise à jour d'une clé n'écrase pas les autres champs de l'objet racine
        saveCollection('search_results', results)
        saveCollection('favorites', favorites)

        const finalStore = JSON.parse(localStorage.getItem('emusic_data'))

        expect(finalStore).toHaveProperty('search_results')
        expect(finalStore).toHaveProperty('favorites')
        expect(finalStore.search_results).toHaveLength(1)
        expect(finalStore.favorites).toHaveLength(1)
    })

    it('devrait gérer les erreurs de parsing JSON de manière gracieuse (Robustesse)', () => {
        /**
         * Simulation d'une corruption de données.
         * L'utilitaire doit capturer l'exception via try/catch et retourner une valeur cohérente.
         */
        localStorage.setItem('emusic_data', 'invalid-json-{')

        const result = loadCollection('search_results')

        // Validation du comportement de secours pour éviter un crash au démarrage de l'app
        expect(result).toEqual([])
    })
})