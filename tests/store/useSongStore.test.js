import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../../src/store/useSongStore.js'
import { player } from '../../src/store/player.js'
import * as storageHelper from '../../src/store/storageHelper.js'
import * as itunesModule from '../../src/api/useITunes.js'

/**
 * Storage Layer Interception.
 * Replaces the persistence engine with controlled mocks to prevent
 * side effects on the host environment's LocalStorage.
 */
vi.mock('../../src/store/storageHelper', () => ({
    loadCollection: vi.fn(() => []),
    saveCollection: vi.fn()
}))

/**
 * Audio Engine Interception.
 * Prevents the store from attempting to trigger real HTML5 Audio
 * elements which are unavailable in the test environment.
 */
vi.mock('../../src/store/player.js', () => ({
    player: {
        play: vi.fn((url, callback) => {
            // Logic: Simulate immediate success without real audio overhead
            return Promise.resolve();
        }),
        pause: vi.fn(),
        stop: vi.fn(),
        onProgress: vi.fn(),
        getCurrentTime: vi.fn(() => 0),
        seek: vi.fn()
    }
}))

/**
 * Unit Test Container: useSongStore - Advanced Queue & Playback Logic.
 * Validates the core audio engine orchestration, including reactive queue
 * displacement and positional playback execution.
 */
describe('useSongStore - Queue Orchestration & Positional Playback', () => {
    let fetchSongsMock;
    let store;

    beforeEach(() => {
        /**
         * Context Initialization.
         * Establishes a clean Pinia instance and resets mock registry
         * to ensure total test isolation.
         */
        setActivePinia(createPinia())
        vi.clearAllMocks()
        sessionStorage.clear()

        fetchSongsMock = vi.fn()
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        })

        store = useSongStore()
    })

    describe('Queue Synchronization Actions', () => {
        it('should execute non-destructive Queue Swap via setQueue', () => {
            const playlistSongs = [
                { trackId: 10, trackName: 'Playlist Track', previewUrl: 'url1' }
            ]
            const playlistName = 'My Summer Mix'

            /**
             * State displacement.
             * Injects the provided song array into the reactive 'songs' reference
             * and updates the contextual 'collectionName'.
             */
            store.setQueue(playlistSongs, playlistName)

            expect(store.songs).toHaveLength(1)
            expect(store.songs[0].trackId).toBe(10)
            expect(store.collectionName).toBe(playlistName)

            /**
             * Storage persistence bypass check.
             * Confirms that transient queue updates do not overwrite
             * the persistent global search history.
             */
            expect(storageHelper.saveCollection).not.toHaveBeenCalledWith('search_results', expect.any(Array))
        })
    })

    describe('Positional Execution Logic', () => {
        it('should map a discrete index to Playback Execution via playSongByIndex', () => {
            const mockQueue = [
                { trackId: 100, trackName: 'First', previewUrl: 'url1' },
                { trackId: 200, trackName: 'Second', previewUrl: 'url2' }
            ]

            /**
             * Queue priming.
             * Manually populates the reactive store state.
             */
            store.songs = mockQueue

            /**
             * Logic execution.
             * Triggers playback for the targeted index (Index 1 = trackId 200).
             */
            store.playSongByIndex(1)

            /**
             * Side-Effect Validation.
             * Instead of spying on the store action, we verify the call reached
             * the mocked player engine with the correct URL.
             */
            expect(player.play).toHaveBeenCalledWith(mockQueue[1].previewUrl, expect.any(Function))
            expect(store.currentSongId).toBe(200)
            expect(store.isPlaying).toBe(true)
        })

        it('should enforce boundary protection for Out-of-Bounds index requests', () => {
            store.songs = [{ trackId: 1, trackName: 'Only', previewUrl: 'url1' }]

            /**
             * Overflow and Underflow validation.
             * Verifies that the player engine is never reached.
             */
            store.playSongByIndex(5)
            store.playSongByIndex(-1)

            expect(player.play).not.toHaveBeenCalled()
            expect(store.currentSongId).toBeNull()
        })

        it('should automatically advance to the next song when the current one finishes', () => {
            store.songs = [
                { trackId: 1, previewUrl: 'url1' },
                { trackId: 2, previewUrl: 'url2' }
            ];

            // Play the first song
            store.playSongByIndex(0);

            // Capture the "onEnded" callback passed to the player
            const onEndedCallback = vi.mocked(player.play).mock.calls[0][1];

            // Execute the callback (simulating song finish)
            onEndedCallback();

            expect(store.currentSongId).toBe(2);
            expect(player.play).toHaveBeenCalledTimes(2);
        });

        it('should stop playback when the last song in the queue finishes', () => {
            store.songs = [{ trackId: 1, previewUrl: 'url1' }];
            store.playSongByIndex(0);

            const onEndedCallback = vi.mocked(player.play).mock.calls[0][1];
            onEndedCallback();

            expect(store.isPlaying).toBe(false);
            expect(store.currentSongId).toBeNull();
        });

        it('should update currentTime and duration when the player reports progress', () => {
            store.playSongByIndex(0);

            // Get the progress listener
            const progressCallback = vi.mocked(player.onProgress).mock.calls[0][0];

            // Simulate player progress (10 seconds in, 30 seconds total)
            progressCallback(10, 30);

            expect(store.currentTime).toBe(10);
            expect(store.duration).toBe(30);
        });

        it('should restart the song on "prev" if currentTime > 3s', () => {
            store.songs = [
                { trackId: 1, previewUrl: 'url1' },
                { trackId: 2, previewUrl: 'url2' }
            ];
            store.playSongByIndex(1); // Play second song

            // Mock player to report 5 seconds elapsed
            vi.mocked(player.getCurrentTime).mockReturnValue(5);

            store.prev();

            // Should call stop and then play the SAME song again
            expect(player.stop).toHaveBeenCalled();
            expect(store.currentSongId).toBe(2);
        });

        it('should reset to featured songs when a search returns no results', async () => {
            fetchSongsMock.mockResolvedValue([]); // Empty API response

            await store.search('NonExistentArtist');

            expect(store.songs).toEqual(expect.arrayContaining([])); // Should match DEFAULT_COLLECTION
            expect(store.collectionName).toBe("Featured Songs");
            expect(store.error).toContain("No results found");
        });
    })
})