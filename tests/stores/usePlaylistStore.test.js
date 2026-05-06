import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlaylistStore } from '../../src/store/usePlaylistStore'
import * as storage from '../../src/store/storageHelper'

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
    })
})