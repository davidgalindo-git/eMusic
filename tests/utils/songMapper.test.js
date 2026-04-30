import { describe, it, expect } from 'vitest'
import { mapSong, sortSongs, mapAndSortSongs, SORT_OPTIONS } from '../../src/utils/songMapper.js'

/**
 * Suite de tests pour l'utilitaire songMapper.
 * Valide la normalisation des données iTunes, la logique de tri et le filtrage des résultats.
 */
describe('songMapper', () => {
    describe('mapSong', () => {
        it('devrait mapper une piste brute complète vers le format normalisé', () => {
            const rawTrack = {
                trackId: 123,
                trackName: 'Test Song',
                artistName: 'Test Artist',
                collectionName: 'Test Album',
                primaryGenreName: 'Rock',
                releaseDate: '2024-01-15T00:00:00Z',
                trackTimeMillis: 240000,
                previewUrl: 'https://example.com/preview.m4a',
                artworkUrl100: 'https://example.com/artwork100x100.jpg',
                trackPrice: 1.29,
                currency: 'USD',
                country: 'USA',
                trackExplicitness: 'explicit',
                trackNumber: 5,
                trackCount: 12
            }

            const result = mapSong(rawTrack)

            // Vérification de la structure de sortie et des types de données
            expect(result).toEqual({
                trackId: 123,
                trackName: 'Test Song',
                artistName: 'Test Artist',
                albumName: 'Test Album',
                genre: 'Rock',
                releaseYear: 2024,
                releaseDate: '2024-01-15T00:00:00Z',
                durationMs: 240000,
                previewUrl: 'https://example.com/preview.m4a',
                artworkUrl: 'https://example.com/artwork300x300.jpg',
                trackPrice: 1.29,
                currency: 'USD',
                country: 'USA',
                explicit: true,
                trackNumber: 5,
                trackCount: 12
            })
        })

        it('devrait gérer les champs optionnels manquants avec des valeurs par défaut', () => {
            const rawTrack = { trackId: 456 }
            const result = mapSong(rawTrack)

            expect(result.trackName).toBe('Unknown Track')
            expect(result.artistName).toBe('Unknown Artist')
            expect(result.durationMs).toBe(0)
            expect(result.artworkUrl).toBeNull()
        })

        it('devrait identifier correctement l\'explicité des pistes', () => {
            const explicitTrack = { trackId: 1, trackExplicitness: 'explicit' }
            const cleanTrack = { trackId: 2, trackExplicitness: 'notExplicit' }

            expect(mapSong(explicitTrack).explicit).toBe(true)
            expect(mapSong(cleanTrack).explicit).toBe(false)
        })

        it('devrait augmenter la résolution de l\'URL de l\'image (100x100 vers 300x300)', () => {
            const rawTrack = {
                trackId: 789,
                artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/100x100bb.jpg'
            }

            const result = mapSong(rawTrack)

            // Validation de la transformation d'URL pour une meilleure qualité visuelle
            expect(result.artworkUrl).toContain('300x300')
            expect(result.artworkUrl).not.toContain('100x100')
        })

        it('devrait extraire correctement l\'année de la propriété releaseDate', () => {
            const testCases = [
                { date: '2024-06-15T00:00:00Z', expectedYear: 2024 },
                { date: '1999-12-31T23:59:59Z', expectedYear: 1999 }
            ]

            testCases.forEach(({ date, expectedYear }) => {
                const result = mapSong({ trackId: 1, releaseDate: date })
                expect(result.releaseYear).toBe(expectedYear)
            })
        })
    })

    describe('SORT_OPTIONS', () => {
        it('devrait exporter des options de tri valides et typées', () => {
            expect(SORT_OPTIONS).toBeInstanceOf(Array)
            SORT_OPTIONS.forEach(option => {
                expect(option).toHaveProperty('key')
                expect(option).toHaveProperty('label')
            })
        })
    })

    describe('sortSongs', () => {
        const mockSongs = [
            { trackId: 1, trackName: 'Zebra', durationMs: 180000, releaseDate: '2024-01-01' },
            { trackId: 2, trackName: 'Apple', durationMs: 240000, releaseDate: '2023-06-15' },
            { trackId: 3, trackName: null, durationMs: null }
        ]

        it('devrait trier par trackName par défaut (croissant)', () => {
            const sorted = sortSongs(mockSongs, 'trackName', 'asc')
            expect(sorted[0].trackName).toBe('Apple')
            expect(sorted[1].trackName).toBe('Zebra')
        })

        it('devrait trier par valeurs numériques (durationMs)', () => {
            const sorted = sortSongs(mockSongs, 'durationMs', 'asc')
            expect(sorted[0].durationMs).toBe(180000)
            expect(sorted[1].durationMs).toBe(240000)
        })

        it('devrait être insensible à la casse lors du tri alphabétique', () => {
            const songs = [
                { trackId: 1, trackName: 'zebra' },
                { trackId: 2, trackName: 'Apple' }
            ]
            const sorted = sortSongs(songs, 'trackName', 'asc')
            expect(sorted[0].trackName).toBe('Apple')
        })

        it('devrait maintenir l\'immutabilité du tableau original', () => {
            const original = [...mockSongs]
            sortSongs(mockSongs, 'trackName', 'asc')
            expect(mockSongs).toEqual(original)
        })

        it('devrait placer systématiquement les valeurs nulles en fin de liste', () => {
            const sortedAsc = sortSongs(mockSongs, 'trackName', 'asc')
            const sortedDesc = sortSongs(mockSongs, 'trackName', 'desc')

            expect(sortedAsc[sortedAsc.length - 1].trackName).toBeNull()
            expect(sortedDesc[sortedDesc.length - 1].trackName).toBeNull()
        })
    })

    describe('mapAndSortSongs', () => {
        const mockRawResults = [
            { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'Zebra' },
            { wrapperType: 'track', kind: 'song', trackId: 2, trackName: 'Apple' },
            { wrapperType: 'collection', kind: 'album', collectionId: 999 } // Doit être filtré
        ]

        it('devrait filtrer les entrées non musicales et appliquer le tri', () => {
            const result = mapAndSortSongs(mockRawResults, 'trackName', 'asc')

            // Le résultat ne doit contenir que des objets de type "piste musicale"
            expect(result).toHaveLength(2)
            expect(result[0].trackName).toBe('Apple')
            expect(result[1].trackName).toBe('Zebra')
        })

        it('devrait retourner un tableau vide pour une entrée vide', () => {
            expect(mapAndSortSongs([])).toEqual([])
        })
    })
})