import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../../src/store/useSongStore.js'
import * as storageHelper from '../../src/store/storageHelper.js'
import * as itunesModule from '../../src/api/useITunes.js' // Ensure this is imported
import { DEFAULT_COLLECTION } from "../../src/store/constants.js";

describe('useSongStore Persistence Logic', () => {
    let fetchSongsMock;

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        sessionStorage.clear()

        // Setup API Mocking
        fetchSongsMock = vi.fn()
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        })

        // Setup Storage Mocking
        vi.spyOn(storageHelper, 'saveCollection')
        vi.spyOn(storageHelper, 'loadCollection').mockReturnValue(null)
    })

    it('should execute Atomic Persistence side-effects on successful search', async () => {
        // Resolve the "Timeout" by providing a settled promise
        fetchSongsMock.mockResolvedValue([
            { trackId: 1, trackName: 'Genesis', wrapperType: 'track', kind: 'song' }
        ])

        const store = useSongStore()
        const searchTerm = 'Justice'

        await store.search(searchTerm)

        // Validate state-to-storage commit
        expect(storageHelper.saveCollection).toHaveBeenCalledWith('search_results', expect.any(Array))
        expect(sessionStorage.getItem('current_collection_name')).toBe(`Results for "${searchTerm}"`)
    })

    it('should maintain Persistence Parity during local sort mutations', () => {
        // Resolve the "AssertionError" by ensuring the store has data to sort
        const mockData = [
            { trackId: 2, trackName: 'B', wrapperType: 'track', kind: 'song' },
            { trackId: 1, trackName: 'A', wrapperType: 'track', kind: 'song' }
        ]

        const store = useSongStore()
        // Manually inject songs into the store state
        store.songs = mockData

        // Execute synchronous sort mutation
        store.setSort('trackName', 'asc')

        // Validate that the sorted aggregate is committed to storage
        // We check for 'A' at index 0 to prove the sort AND the save occurred
        expect(storageHelper.saveCollection).toHaveBeenCalledWith(
            'search_results',
            expect.arrayContaining([expect.objectContaining({ trackName: 'A' })])
        )
        expect(store.songs[0].trackName).toBe('A')
    })
})