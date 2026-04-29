import { describe, it, expect } from 'vitest'
import { mapSong, sortSongs, mapAndSortSongs, SORT_OPTIONS } from '../../../src/utils/songMapper.js'

describe('songMapper', () => {
    describe('mapSong', () => {
        it('should map a complete raw track to normalized format', () => {
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

        it('should handle missing optional fields with defaults', () => {
            const rawTrack = {
                trackId: 456
            }

            const result = mapSong(rawTrack)

            expect(result.trackName).toBe('Unknown Track')
            expect(result.artistName).toBe('Unknown Artist')
            expect(result.albumName).toBe('Unknown Album')
            expect(result.genre).toBe('Unknown Genre')
            expect(result.releaseYear).toBeNull()
            expect(result.releaseDate).toBeNull()
            expect(result.durationMs).toBe(0)
            expect(result.previewUrl).toBeNull()
            expect(result.artworkUrl).toBeNull()
        })

        it('should correctly identify explicit tracks', () => {
            const explicitTrack = { trackId: 1, trackExplicitness: 'explicit' }
            const cleanTrack = { trackId: 2, trackExplicitness: 'notExplicit' }

            expect(mapSong(explicitTrack).explicit).toBe(true)
            expect(mapSong(cleanTrack).explicit).toBe(false)
        })

        it('should upgrade artwork URL from 100x100 to 300x300', () => {
            const rawTrack = {
                trackId: 789,
                artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/100x100bb.jpg'
            }

            const result = mapSong(rawTrack)

            expect(result.artworkUrl).toContain('300x300')
            expect(result.artworkUrl).not.toContain('100x100')
        })

        it('should extract year from releaseDate correctly', () => {
            const testCases = [
                { date: '2024-06-15T00:00:00Z', expectedYear: 2024 },
                { date: '2000-01-01T00:00:00Z', expectedYear: 2000 },
                { date: '1999-12-31T23:59:59Z', expectedYear: 1999 }
            ]

            testCases.forEach(({ date, expectedYear }) => {
                const result = mapSong({ trackId: 1, releaseDate: date })
                expect(result.releaseYear).toBe(expectedYear)
            })
        })
    })

    describe('SORT_OPTIONS', () => {
        it('should export valid sort options', () => {
            expect(SORT_OPTIONS).toBeInstanceOf(Array)
            expect(SORT_OPTIONS.length).toBeGreaterThan(0)

            SORT_OPTIONS.forEach(option => {
                expect(option).toHaveProperty('key')
                expect(option).toHaveProperty('label')
                expect(typeof option.key).toBe('string')
                expect(typeof option.label).toBe('string')
            })
        })

        it('should contain expected sort keys', () => {
            const keys = SORT_OPTIONS.map(opt => opt.key)

            expect(keys).toContain('trackName')
            expect(keys).toContain('artistName')
            expect(keys).toContain('albumName')
            expect(keys).toContain('releaseDate')
            expect(keys).toContain('durationMs')
            expect(keys).toContain('trackNumber')
        })
    })

    describe('sortSongs', () => {
        const mockSongs = [
            { trackId: 1, trackName: 'Zebra', artistName: 'Artist A', durationMs: 180000, releaseDate: '2024-01-01', trackNumber: 3 },
            { trackId: 2, trackName: 'Apple', artistName: 'Artist C', durationMs: 240000, releaseDate: '2023-06-15', trackNumber: 1 },
            { trackId: 3, trackName: 'Banana', artistName: 'Artist B', durationMs: 200000, releaseDate: '2024-03-20', trackNumber: 2 },
            { trackId: 4, trackName: 'Cherry', artistName: null, durationMs: null, releaseDate: null, trackNumber: null }
        ]

        it('should sort by trackName ascending by default', () => {
            const sorted = sortSongs(mockSongs, 'trackName', 'asc')

            expect(sorted[0].trackName).toBe('Apple')
            expect(sorted[1].trackName).toBe('Banana')
            expect(sorted[2].trackName).toBe('Cherry')
            expect(sorted[3].trackName).toBe('Zebra')
        })

        it('should sort by trackName descending', () => {
            const sorted = sortSongs(mockSongs, 'trackName', 'desc')

            expect(sorted[0].trackName).toBe('Zebra')
            expect(sorted[1].trackName).toBe('Cherry')
            expect(sorted[2].trackName).toBe('Banana')
            expect(sorted[3].trackName).toBe('Apple')
        })

        it('should sort by artistName correctly', () => {
            const sorted = sortSongs(mockSongs, 'artistName', 'asc')

            expect(sorted[0].artistName).toBe('Artist A')
            expect(sorted[1].artistName).toBe('Artist B')
            expect(sorted[2].artistName).toBe('Artist C')
            expect(sorted[3].artistName).toBeNull() // Null values sink to bottom
        })

        it('should sort by numeric values (durationMs)', () => {
            const sorted = sortSongs(mockSongs, 'durationMs', 'asc')

            expect(sorted[0].durationMs).toBe(180000)
            expect(sorted[1].durationMs).toBe(200000)
            expect(sorted[2].durationMs).toBe(240000)
            expect(sorted[3].durationMs).toBeNull()
        })

        it('should sort by releaseDate', () => {
            const sorted = sortSongs(mockSongs, 'releaseDate', 'asc')

            expect(sorted[0].releaseDate).toBe('2023-06-15')
            expect(sorted[1].releaseDate).toBe('2024-01-01')
            expect(sorted[2].releaseDate).toBe('2024-03-20')
            expect(sorted[3].releaseDate).toBeNull()
        })

        it('should not mutate original array', () => {
            const original = [...mockSongs]
            sortSongs(mockSongs, 'trackName', 'asc')

            expect(mockSongs).toEqual(original)
        })

        it('should handle empty array', () => {
            const sorted = sortSongs([], 'trackName')
            expect(sorted).toEqual([])
        })

        it('should handle array with single item', () => {
            const single = [mockSongs[0]]
            const sorted = sortSongs(single, 'trackName')

            expect(sorted).toEqual(single)
        })

        it('should be case-insensitive for string sorting', () => {
            const songs = [
                { trackId: 1, trackName: 'zebra' },
                { trackId: 2, trackName: 'Apple' },
                { trackId: 3, trackName: 'BANANA' }
            ]

            const sorted = sortSongs(songs, 'trackName', 'asc')

            expect(sorted[0].trackName).toBe('Apple')
            expect(sorted[1].trackName).toBe('BANANA')
            expect(sorted[2].trackName).toBe('zebra')
        })

        it('should place all null values at the end regardless of order', () => {
            const songs = [
                { trackId: 1, trackName: 'A' },
                { trackId: 2, trackName: null },
                { trackId: 3, trackName: 'B' },
                { trackId: 4, trackName: null }
            ]

            const sortedAsc = sortSongs(songs, 'trackName', 'asc')
            const sortedDesc = sortSongs(songs, 'trackName', 'desc')

            expect(sortedAsc[sortedAsc.length - 1].trackName).toBeNull()
            expect(sortedAsc[sortedAsc.length - 2].trackName).toBeNull()

            expect(sortedDesc[sortedDesc.length - 1].trackName).toBeNull()
            expect(sortedDesc[sortedDesc.length - 2].trackName).toBeNull()
        })
    })

    describe('mapAndSortSongs', () => {
        const mockRawResults = [
            {
                wrapperType: 'track',
                kind: 'song',
                trackId: 1,
                trackName: 'Zebra Song',
                artistName: 'Artist A',
                releaseDate: '2024-01-01T00:00:00Z'
            },
            {
                wrapperType: 'track',
                kind: 'song',
                trackId: 2,
                trackName: 'Apple Song',
                artistName: 'Artist B',
                releaseDate: '2023-06-15T00:00:00Z'
            },
            {
                wrapperType: 'collection', // Should be filtered out
                kind: 'album',
                collectionId: 999
            },
            {
                wrapperType: 'track',
                kind: 'music-video', // Should be filtered out
                trackId: 888
            }
        ]

        it('should map and sort results correctly', () => {
            const result = mapAndSortSongs(mockRawResults, 'trackName', 'asc')

            expect(result).toHaveLength(2)
            expect(result[0].trackName).toBe('Apple Song')
            expect(result[1].trackName).toBe('Zebra Song')
        })

        it('should filter out non-song entries', () => {
            const result = mapAndSortSongs(mockRawResults)

            result.forEach(song => {
                expect(song).toHaveProperty('trackId')
                expect(song).toHaveProperty('trackName')
            })

            expect(result.every(song => song.trackId !== 999 && song.trackId !== 888)).toBe(true)
        })

        it('should use default sort parameters', () => {
            const result = mapAndSortSongs(mockRawResults)

            expect(result[0].trackName).toBe('Apple Song') // Default: trackName, asc
        })

        it('should respect custom sort parameters', () => {
            const result = mapAndSortSongs(mockRawResults, 'releaseDate', 'desc')

            expect(result[0].releaseDate).toBe('2024-01-01T00:00:00Z')
            expect(result[1].releaseDate).toBe('2023-06-15T00:00:00Z')
        })

        it('should handle empty results array', () => {
            const result = mapAndSortSongs([])

            expect(result).toEqual([])
        })

        it('should map all song properties correctly', () => {
            const result = mapAndSortSongs(mockRawResults)

            result.forEach(song => {
                expect(song).toHaveProperty('trackId')
                expect(song).toHaveProperty('trackName')
                expect(song).toHaveProperty('artistName')
                expect(song).toHaveProperty('albumName')
                expect(song).toHaveProperty('genre')
                expect(song).toHaveProperty('releaseYear')
                expect(song).toHaveProperty('durationMs')
                expect(song).toHaveProperty('artworkUrl')
            })
        })
    })
})