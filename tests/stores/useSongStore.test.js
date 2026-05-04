import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../../src/store/useSongStore.js'
import { useITunes } from "../../src/api/useITunes.js"
import * as itunesModule from '../../src/api/useITunes.js'
import { player } from '../../src/store/player.js'
import { DEFAULT_COLLECTION } from "../../src/store/constants.js";

/**
 * Unit test suite for the 'useSongStore' Pinia store.
 * Validates state machine transitions, aggregate root logic, and asynchronous side-effect orchestration.
 */

// Global module interception for external dependencies (API and Audio Player).
vi.mock('../api/useITunes', () => ({
    useITunes: vi.fn(() => ({
        fetchSongs: vi.fn()
    }))
}))

vi.mock('../../src/store/player.js', () => ({
    player: {
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        seek: vi.fn(),
        getCurrentTime: vi.fn(),
        onProgress: vi.fn()
    }
}))

describe('useSongStore', () => {
    let fetchSongsMock;

    beforeEach(() => {
        // Context isolation: Resets Pinia before each test to prevent state leakage.
        setActivePinia(createPinia())

        fetchSongsMock = vi.fn();

        // API Spy injection to control network-layer behavior during tests.
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        });
        vi.clearAllMocks();
    })

    it('should initialize state with designated default schema', () => {
        const store = useSongStore()
        expect(store.songs).toEqual([]) // Starts empty
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.sortKey).toBe('trackName')
    })

    it('should hydrate store state upon successful API resolution', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        const mockRawSongs = [
            { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'Song A' }
        ]

        fetchSongs.mockResolvedValue(mockRawSongs)
        await store.search('test')

        // Verify data was mapped and stored correctly.
        expect(store.songs.length).toBe(1)
        expect(store.songs[0].trackName).toBe('Song A')
    })

    it('should catch exceptions and transit to error state', async () => {
        // Mocks console to keep test logs clean.
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const store = useSongStore()
        const { fetchSongs } = useITunes()

        fetchSongs.mockRejectedValue(new Error('API Down'))

        await store.search('test')

        // Error Recovery: State should show error message and display default songs.
        expect(store.loading).toBe(false)
        expect(store.error).toBe('Unable to load songs. Showing featured collection.')
        expect(store.songs).toEqual(DEFAULT_COLLECTION)

        consoleSpy.mockRestore()
    })

    it('should reorder localized collection via setSort without redundant API calls', () => {
        const store = useSongStore()
        store.songs = [
            { trackId: 1, trackName: 'Zebra' },
            { trackId: 2, trackName: 'Apple' }
        ]

        // Local sorting logic validation.
        store.setSort('trackName', 'asc')

        expect(store.songs[0].trackName).toBe('Apple')
    })

    it('should initiate playback and synchronize store playback flags', () => {
        const store = useSongStore()
        const mockSong = { trackId: 123, previewUrl: 'http://test.mp3' }

        store.togglePlay(mockSong)

        // Verifies store calls the player hardware and updates reactive flags.
        expect(player.play).toHaveBeenCalledWith(mockSong.previewUrl, expect.any(Function))
        expect(store.isPlaying).toBe(true)
        expect(store.currentSongId).toBe(123)
    })

    it('should restart current track via "prev" if progress > 3s', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 2 });

        player.getCurrentTime.mockReturnValue(5) // Past threshold

        store.prev()

        expect(player.stop).toHaveBeenCalled()
        expect(store.currentSongId).toBe(2) // Restarted, did not skip.
    })
})