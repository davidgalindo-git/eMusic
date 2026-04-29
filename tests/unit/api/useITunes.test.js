import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useITunes } from '../../../src/api/useITunes.js'

describe('useITunes', () => {
    let fetchMock

    beforeEach(() => {
        // Mock global fetch
        fetchMock = vi.fn()
        global.fetch = fetchMock
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('fetchSongs', () => {
        it('should fetch songs successfully with valid term', async () => {
            const mockData = {
                results: [
                    { trackId: 1, trackName: 'Test Song', artistName: 'Test Artist' }
                ]
            }

            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            })

            const { fetchSongs } = useITunes()
            const result = await fetchSongs('test')

            expect(fetchMock).toHaveBeenCalledWith(
                'https://itunes.apple.com/search?term=test&media=music&limit=20'
            )
            expect(result).toEqual(mockData.results)
        })

        it('should encode URI components in search term', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            await fetchSongs('test & special chars')

            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('test%20%26%20special%20chars')
            )
        })

        it('should throw error when response is not ok', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            })

            const { fetchSongs } = useITunes()

            await expect(fetchSongs('test')).rejects.toThrow('iTunes API Error: Not Found')
        })

        it('should handle network errors', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'))

            const { fetchSongs } = useITunes()

            await expect(fetchSongs('test')).rejects.toThrow('Network error')
        })

        it('should return empty array when no results', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            const result = await fetchSongs('nonexistentartist12345')

            expect(result).toEqual([])
        })

        it('should handle special characters in search term', async () => {
            const specialTerms = ['AC/DC', 'R&B', 'hip-hop', 'björk']

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()

            for (const term of specialTerms) {
                await fetchSongs(term)
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining(encodeURIComponent(term))
                )
            }
        })
    })
})