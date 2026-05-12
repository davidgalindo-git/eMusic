import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlaylistStore } from '../../src/store/usePlaylistStore'
import { saveCollection } from '../../src/store/storageHelper';

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
 * Unit Test Container: playlistStore.
 * Validates the lifecycle of user-defined collections, including
 * unique identification, data normalization, and cross-store
 * playback synchronization.
 */
describe('playlistStore - Collection Logic & State Synchronization', () => {
    let store;

    beforeEach(() => {
        /**
         * Context Initialization.
         * Establishes a clean Pinia instance and resets the mock registry
         * to ensure total test isolation.
         */
        setActivePinia(createPinia())
        vi.clearAllMocks()
        store = usePlaylistStore()
    })

    describe('Collection Lifecycle', () => {
        it('should execute non-destructive creation with unique temporal IDs', () => {
            const name = 'Electronic Beats'

            /**
             * Resource allocation.
             * Generates a new playlist node and pushes it to the reactive stack.
             */
            const playlist = store.createPlaylist(name)

            expect(store.playlists).toHaveLength(1)
            expect(store.playlists[0].name).toBe(name)
            expect(typeof playlist.id).toBe('number') // Derived from Date.now()
        })

        it('should handle playlist deletion and resolve dangling references', () => {
            const playlist = store.createPlaylist('To Remove')

            /**
             * Pointer assignment.
             * Sets the active UI context to the targeted playlist.
             */
            store.selectPlaylist(playlist.id)
            expect(store.selectedPlaylist.id).toBe(playlist.id)

            /**
             * State displacement.
             * Removes the node and resets the selection pointer to null.
             */
            store.deletePlaylist(playlist.id)

            expect(store.playlists).toHaveLength(0)
            expect(store.selectedPlaylist).toBeNull()
        })

        it('should perform sanitized renaming via string normalization', () => {
            const playlist = store.createPlaylist('Original')

            /**
             * Property mutation.
             * Trims whitespace and updates the 'name' primitive.
             */
            store.renamePlaylist(playlist.id, '  Refined Name  ')

            expect(store.playlists[0].name).toBe('Refined Name')
        })

        it('should update the error state when storage quota is exceeded', async () => {
            const saveMock = vi.mocked(saveCollection);

            saveMock.mockImplementationOnce(() => {
                throw new Error('QuotaExceededError');
            });

            // 1. Trigger the change
            store.createPlaylist('Crash Test');

            // 2. Wait for the watcher to fire
            await nextTick();

            // 3. Now the error should be populated
            expect(store.error).toBe('Failed to save playlists. Storage might be full.');
        });
    })

    describe('Data Integrity & Normalization', () => {
        const mockSong = {
            trackId: 999,
            trackName: 'Synth Wave',
            artistName: 'AI Producer',
            artworkUrl: 'cover.png',
            previewUrl: 'stream.mp3',
            extraData: 'discard me' // Used to test normalization
        }

        it('should normalize song objects to maintain storage efficiency', () => {
            const playlist = store.createPlaylist('Clean Store')

            /**
             * Schema enforcement.
             * Injects only the properties required for the SongCard interface.
             */
            store.addToPlaylist(playlist.id, mockSong)

            const savedSong = playlist.songs[0]
            expect(savedSong).not.toHaveProperty('extraData')
            expect(savedSong.trackId).toBe(999)
        })

        it('should enforce referential uniqueness to prevent duplicate entries', () => {
            const playlist = store.createPlaylist('Unique List')

            /**
             * Duplicate check execution.
             * Internal logic utilizes .some() to verify trackId collision.
             */
            store.addToPlaylist(playlist.id, mockSong)
            store.addToPlaylist(playlist.id, mockSong)

            expect(playlist.songs).toHaveLength(1)
        })

        it('should ignore renaming attempts with empty or whitespace-only strings', () => {
            const playlist = store.createPlaylist('Valid Name');

            store.renamePlaylist(playlist.id, '   ');
            expect(store.playlists[0].name).toBe('Valid Name');

            store.renamePlaylist(playlist.id, null);
            expect(store.playlists[0].name).toBe('Valid Name');
        });

        it('should not attempt to play an empty playlist', () => {
            const playlist = store.createPlaylist('Empty');
            store.playPlaylist(playlist.id);

            expect(store.playingPlaylist).toBeNull();
        });
    })

    describe('Engine Orchestration', () => {
        it('should broadcast the playlist collection to the playback engine', () => {
            const playlist = store.createPlaylist('Playback Test')
            store.addToPlaylist(playlist.id, { trackId: 1, trackName: 'Test' })

            /**
             * Cross-store communication.
             * Sets the 'playingPlaylist' anchor and triggers the songStore hot-swap.
             */
            store.playPlaylist(playlist.id)

            expect(store.playingPlaylist.id).toBe(playlist.id)
            // Implicitly validates that no crash occurs during songStore interaction.
        })

        it('should trigger persistence when a song is removed from a playlist', async () => {
            // 1. Get the mocked version of the function
            const saveMock = vi.mocked(saveCollection);

            const playlist = store.createPlaylist('Persistence Test');
            store.addToPlaylist(playlist.id, { trackId: 1, trackName: 'Test' });

            // 2. Clear the "history" of the mock
            saveMock.mockClear();

            store.removeFromPlaylist(playlist.id, 1);

            // 3. Wait for the watcher to finish
            await nextTick();

            // 4. Verify the call
            expect(saveMock).toHaveBeenCalled();
        });

        it('should clear playingPlaylist if the currently playing playlist is deleted', () => {
            const playlist = store.createPlaylist('Live List');
            store.addToPlaylist(playlist.id, { trackId: 1, trackName: 'Song' });

            store.playPlaylist(playlist.id);
            expect(store.playingPlaylist.id).toBe(playlist.id);

            store.deletePlaylist(playlist.id);

            // This currently fails with your code—playingPlaylist remains set
            expect(store.playingPlaylist).toBeNull();
        });
    })
})