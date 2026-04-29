import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../store/useSongStore'
import {useITunes} from "../api/useITunes";

import * as itunesModule from '../api/useITunes'

// Mock de l'API pour isoler le test du Store
vi.mock('../api/useITunes', () => ({
    useITunes: vi.fn(() => ({
        fetchSongs: vi.fn()
    }))
}))

describe('useSongStore', () => {
    let fetchSongsMock;

    beforeEach(() => {
        setActivePinia(createPinia())

        // On crée un espion (spy) propre pour chaque test
        fetchSongsMock = vi.fn();

        // On force useITunes à retourner notre espion
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        });
    })

    it('devrait avoir un état initial correct', () => {
        const store = useSongStore()
        expect(store.songs).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.sortKey).toBe('trackName')
        expect(store.sortOrder).toBe('asc')
    })

    it('devrait mettre à jour les chansons après une recherche réussie', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        // CRITICAL: Must include wrapperType and kind to pass the filter
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

        expect(store.songs.length).toBe(1)
        expect(store.songs[0].trackName).toBe('Song A')
    })

    it('devrait gérer les erreurs de recherche', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        // On simule une erreur réseau
        fetchSongs.mockRejectedValue(new Error('API Down'))

        await store.search('test')

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Unable to load songs. Please check your connection.')
        expect(store.songs).toEqual([])
    })

    it('devrait re-trier la liste existante avec setSort', () => {
        const store = useSongStore()

        // We set pre-mapped/raw-like data that setSort will process
        const mockData = [
            { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'Zebra' },
            { wrapperType: 'track', kind: 'song', trackId: 2, trackName: 'Apple' }
        ]

        // Initial state
        store.songs = mockData

        // setSort runs mapAndSortSongs on store.songs
        store.setSort('trackName', 'asc')

        expect(store.songs.length).toBe(2)
        expect(store.songs[0].trackName).toBe('Apple')
        expect(store.songs[1].trackName).toBe('Zebra')
    })

    it('devrait activer le flag loading pendant la recherche', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        // On crée une promesse qui ne se résout pas immédiatement
        let resolvePromise
        fetchSongs.mockReturnValue(new Promise((res) => { resolvePromise = res }))

        const searchPromise = store.search('test')

        expect(store.loading).toBe(true)

        resolvePromise([]) // On finit la promesse
        await searchPromise

        expect(store.loading).toBe(false)
    })
})