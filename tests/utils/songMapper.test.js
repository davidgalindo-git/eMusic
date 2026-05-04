import { describe, it, expect } from 'vitest'
import { mapSong, sortSongs, mapAndSortSongs, SORT_OPTIONS } from '../../src/utils/songMapper.js'

/**
 * Unit test suite for the songMapper utility.
 * Validates iTunes data normalization, sorting heuristics, and result filtering.
 */
describe('songMapper', () => {
    describe('mapSong', () => {
        it('should map a complete raw track to the normalized schema', () => {
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

            /**
             * Output structure and data type validation.
             * Ensures proper transformation of camelCase keys and numeric conversions.
             */
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

        it('should fallback to default values for missing optional fields', () => {
            const rawTrack = { trackId: 456 }
            const result = mapSong(rawTrack)

            expect(result.trackName).toBe('Unknown Track')
            expect(result.artistName).toBe('Unknown Artist')
            expect(result.durationMs).toBe(0)
            expect(result.artworkUrl).toBeNull()
        })

        it('should correctly evaluate track explicitness as boolean', () => {
            const explicitTrack = { trackId: 1, trackExplicitness: 'explicit' }
            const cleanTrack = { trackId: 2, trackExplicitness: 'notExplicit' }

            expect(mapSong(explicitTrack).explicit).toBe(true)
            expect(mapSong(cleanTrack).explicit).toBe(false)
        })

        it('should upscale artwork URL resolution (100x100 to 300x300)', () => {
            const rawTrack = {
                trackId: 789,
                artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/100x100bb.jpg'
            }

            const result = mapSong(rawTrack)

            // Validate string manipulation for enhanced visual fidelity.
            expect(result.artworkUrl).toContain('300x300')
            expect(result.artworkUrl).not.toContain('100x100')
        })

        it('should extract the ISO year from the releaseDate property', () => {
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
        it('should export a validated and typed array of sorting configurations', () => {
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

        it('should sort by trackName alphabetically by default (ASC)', () => {
            const sorted = sortSongs(mockSongs, 'trackName', 'asc')
            expect(sorted[0].trackName).toBe('Apple')
            expect(sorted[1].trackName).toBe('Zebra')
        })

        it('should sort by numeric durationMs values', () => {
            const sorted = sortSongs(mockSongs, 'durationMs', 'asc')
            expect(sorted[0].durationMs).toBe(180000)
            expect(sorted[1].durationMs).toBe(240000)
        })

        it('should ensure case-insensitivity during string comparisons', () => {
            const songs = [
                { trackId: 1, trackName: 'zebra' },
                { trackId: 2, trackName: 'Apple' }
            ]
            const sorted = sortSongs(songs, 'trackName', 'asc')
            expect(sorted[0].trackName).toBe('Apple')
        })

        it('should maintain immutability of the source array', () => {
            const original = [...mockSongs]
            sortSongs(mockSongs, 'trackName', 'asc')
            expect(mockSongs).toEqual(original)
        })

        it('should consistently append null values to the end of the collection', () => {
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
            { wrapperType: 'collection', kind: 'album', collectionId: 999 } // Expected to be filtered out
        ]

        it('should filter non-song entities and execute final sorting', () => {
            const result = mapAndSortSongs(mockRawResults, 'trackName', 'asc')

            // Result set should only include "track" wrapper types.
            expect(result).toHaveLength(2)
            expect(result[0].trackName).toBe('Apple')
            expect(result[1].trackName).toBe('Zebra')
        })

        it('should return an empty array when input is empty or null', () => {
            expect(mapAndSortSongs([])).toEqual([])
        })
    })
})