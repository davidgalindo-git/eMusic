import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useITunes } from '../../src/api/useITunes.js'

/**
 * Unit test suite for the useITunes composable.
 * Verifies the encapsulation of iTunes API calls and network stream management.
 */
describe('useITunes', () => {
    let fetchMock

    beforeEach(() => {
        // Global fetch substitution with a mock spy for environment isolation
        fetchMock = vi.fn()
        global.fetch = fetchMock
    })

    afterEach(() => {
        // Reset all mocks to ensure test idempotency and prevent state leakage
        vi.restoreAllMocks()
    })

    describe('fetchSongs', () => {
        it('should return tracks successfully for a valid search term', async () => {
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

            // Validation of URL construction and data extraction
            expect(fetchMock).toHaveBeenCalledWith(
                'https://itunes.apple.com/search?term=test&media=music&limit=20'
            )
            expect(result).toEqual(mockData.results)
        })

        it('should URI-encode components within the search term', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            await fetchSongs('test & special chars')

            // Verify reserved characters are correctly escaped to prevent malformed queries
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('test%20%26%20special%20chars')
            )
        })

        it('should throw an exception for non-compliant HTTP responses', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            })

            const { fetchSongs } = useITunes()

            // Verify error propagation including the specific HTTP status
            await expect(fetchSongs('test')).rejects.toThrow('iTunes API Error: Not Found')
        })

        it('should propagate native network errors', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'))

            const { fetchSongs } = useITunes()

            // Verify handling of low-level fetch rejections (e.g., DNS failure)
            await expect(fetchSongs('test')).rejects.toThrow('Network error')
        })

        it('should return an empty collection if no results are found', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            const result = await fetchSongs('nonexistentartist12345')

            // Type consistency: ensures the UI receives an array regardless of result count
            expect(result).toEqual([])
        })

        it('should correctly process various special character formats', async () => {
            const specialTerms = ['AC/DC', 'R&B', 'hip-hop', 'björk']

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()

            for (const term of specialTerms) {
                await fetchSongs(term)
                // Dynamic encoding validation for each diverse case
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining(encodeURIComponent(term))
                )
            }
        })
    })
})