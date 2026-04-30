import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveCollection, loadCollection } from '../../src/store/storageHelper.js'

describe('storageHelper.js - Gestion du LocalStorage', () => {

    // Nettoyage avant chaque test
    beforeEach(() => {
        localStorage.clear()
        // On réinitialise tous les mocks pour repartir sur une base propre
        vi.clearAllMocks()
    })

    it('devrait sauvegarder une collection de chansons correctement', () => {
        const mockSongs = [
            { trackId: 1, trackName: 'Test Song' },
            { trackId: 2, trackName: 'Another Song' }
        ]

        saveCollection('search_results', mockSongs)

        // On vérifie que la clé racine existe dans le localStorage
        const storedData = JSON.parse(localStorage.getItem('emusic_data'))

        expect(storedData).toHaveProperty('search_results')
        expect(storedData.search_results).toHaveLength(2)
        expect(storedData.search_results[0].trackName).toBe('Test Song')
    })

    it('devrait retourner un tableau vide si la collection n’existe pas', () => {
        const result = loadCollection('non_existent_key')

        expect(result).toEqual([])
        expect(Array.isArray(result)).toBe(true)
    })

    it('devrait récupérer les chansons précédemment sauvegardées', () => {
        const mockFavorites = [{ trackId: 99, trackName: 'Favorite' }]

        // On simule une sauvegarde
        saveCollection('favorites', mockFavorites)

        // On tente de charger
        const loaded = loadCollection('favorites')

        expect(loaded).toEqual(mockFavorites)
        expect(loaded[0].trackId).toBe(99)
    })

    it('devrait permettre de stocker plusieurs collections sans écraser les autres', () => {
        const results = [{ trackId: 1 }]
        const favorites = [{ trackId: 2 }]

        saveCollection('search_results', results)
        saveCollection('favorites', favorites)

        const finalStore = JSON.parse(localStorage.getItem('emusic_data'))

        // Vérification de la cohabitation des clés
        expect(finalStore).toHaveProperty('search_results')
        expect(finalStore).toHaveProperty('favorites')
        expect(finalStore.search_results).toHaveLength(1)
        expect(finalStore.favorites).toHaveLength(1)
    })

    it('devrait gérer les erreurs de parsing JSON gracieusement', () => {
        // On corrompt manuellement le localStorage avec une chaîne invalide
        localStorage.setItem('emusic_data', 'invalid-json-{')

        // Le helper doit retourner [] au lieu de faire planter l'app
        const result = loadCollection('search_results')
        expect(result).toEqual([])
    })
})