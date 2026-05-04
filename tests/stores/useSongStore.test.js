import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../../src/store/useSongStore.js'
import { useITunes } from "../../src/api/useITunes.js"
import * as itunesModule from '../../src/api/useITunes.js'
import { player } from '../../src/store/player.js'

/**
 * Unit test suite for the 'useSongStore' Pinia store.
 * Validates state machine transitions, aggregate root logic, and asynchronous side-effect orchestration.
 */

// Global module interception for external dependencies.
vi.mock('../api/useITunes', () => ({
    useITunes: vi.fn(() => ({
        fetchSongs: vi.fn()
    }))
}))

// Abstraction of the audio hardware interface.
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
        /**
         * Context isolation.
         * Resets the Pinia global state tree to prevent cross-test contamination.
         */
        setActivePinia(createPinia())

        fetchSongsMock = vi.fn();

        /**
         * API Spy injection.
         * Overrides the itunesModule exports to capture and control network-layer behavior.
         */
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        });
        vi.clearAllMocks();
    })

    it('should initialize state with designated default schema', () => {
        const store = useSongStore()
        expect(store.songs).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.sortKey).toBe('trackName')
        expect(store.sortOrder).toBe('asc')
    })

    it('should hydrate store state upon successful API resolution', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        /**
         * Mock data injection.
         * Defines a raw payload compliant with the internal mapping and filtering predicates.
         */
        const mockRawSongs = [
            {
                wrapperType: 'track',
                kind: 'song',
                trackId: 1,
                trackName: 'Song A',
                artistName: 'Artist A'
            }
        ]

        fetchSongs.mockResolvedValue(mockRawSongs)
        await store.search('test')

        // Assert state mutation and data integrity.
        expect(store.songs.length).toBe(1)
        expect(store.songs[0].trackName).toBe('Song A')
    })

    it('should catch exceptions and transit to error state', async () => {
        /**
         * Stdout sanitation.
         * Mocks console.error to maintain clean test output during expected failure paths.
         */
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const store = useSongStore()
        const { fetchSongs } = useITunes()

        fetchSongs.mockRejectedValue(new Error('API Down'))

        await store.search('test')

        // Validate error handling logic and state recovery.
        expect(store.loading).toBe(false)
        expect(store.error).toBe('Unable to load songs. Please check your connection.')
        expect(store.songs).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })

    it('should reorder localized collection via setSort without redundant API calls', () => {
        const store = useSongStore()

        const mockData = [
            { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'Zebra' },
            { wrapperType: 'track', kind: 'song', trackId: 2, trackName: 'Apple' }
        ]

        store.songs = mockData

        /**
         * Sort logic execution.
         * Triggers internal mapAndSortSongs logic via the public action.
         */
        store.setSort('trackName', 'asc')

        expect(store.songs.length).toBe(2)
        expect(store.songs[0].trackName).toBe('Apple')
        expect(store.songs[1].trackName).toBe('Zebra')
    })

    it('should synchronize reactive "loading" flag during the async lifecycle', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        /**
         * Latency simulation.
         * Manually controls promise resolution to inspect intermediary pending states.
         */
        let resolvePromise
        fetchSongs.mockReturnValue(new Promise((res) => { resolvePromise = res }))

        const searchPromise = store.search('test')

        // Verify "pending" state.
        expect(store.loading).toBe(true)

        resolvePromise([])
        await searchPromise

        // Verify "settled" state.
        expect(store.loading).toBe(false)
    })

    it('should initiate playback and synchronize store playback flags', () => {
        const store = useSongStore()
        const mockSong = { trackId: 123, previewUrl: 'http://test.mp3' }

        store.togglePlay(mockSong)

        // Assert interaction with the underlying audio utility.
        expect(player.play).toHaveBeenCalledWith(mockSong.previewUrl, expect.any(Function))
        expect(store.isPlaying).toBe(true)
        expect(store.currentSongId).toBe(123)
    })

    it('should toggle to pause state if active song is re-invoked', () => {
        const store = useSongStore()
        const mockSong = { trackId: 123, previewUrl: 'http://test.mp3' }

        // Setup active playback state.
        store.isPlaying = true
        store.$patch({ currentSongId: 123 });

        store.togglePlay(mockSong)

        expect(player.pause).toHaveBeenCalled()
        expect(store.isPlaying).toBe(false)
    })

    it('should iterate currentSongId to the next index in the collection', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 1 });

        store.next()

        expect(store.currentSongId).toBe(2)
        expect(player.play).toHaveBeenCalled()
    })

    it('should restart the active track via "prev" if temporal progress exceeds 3s', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 2 });

        /**
         * Temporal mock.
         * Simulates a condition where the seek position is past the restart threshold.
         */
        player.getCurrentTime.mockReturnValue(5)

        store.prev()

        expect(player.stop).toHaveBeenCalled()
        expect(store.currentSongId).toBe(2) // State preserved on current track.
        expect(player.play).toHaveBeenCalled()
    })

    it('should decrement collection index via "prev" if temporal progress is below 3s', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 2 });

        // Simulate seek position within the skip threshold.
        player.getCurrentTime.mockReturnValue(1)

        store.prev()

        expect(store.currentSongId).toBe(1) // Transitioned to predecessor.
    })

    it('should dispatch seek request to player utility and update reactive state', () => {
        const store = useSongStore()

        store.seek(15)

        expect(player.seek).toHaveBeenCalledWith(15)
        expect(store.currentTime).toBe(15)
    })

    it('should compute the current song index relative to the active collection', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 10 }, { trackId: 20 }, { trackId: 30 }]

        // Scenario: Valid track identification.
        store.$patch({ currentSongId: 20 });
        expect(store.currentIndex).toBe(1)

        // Scenario: OOR (Out of Range) or missing identification.
        store.$patch({ currentSongId: 99 });
        expect(store.currentIndex).toBe(-1)
    })
})