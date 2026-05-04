import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSongStore } from '../../src/store/useSongStore.js'
import { useITunes } from "../../src/api/useITunes.js"
import * as itunesModule from '../../src/api/useITunes.js'
import { player } from '../../src/store/player.js'

/**
 * Suite de tests unitaires pour le store Pinia 'useSongStore'.
 * Focalisé sur la gestion d'état, l'intégration du mapper et la gestion des flux asynchrones.
 */
// Mocking the API module
vi.mock('../api/useITunes', () => ({
    useITunes: vi.fn(() => ({
        fetchSongs: vi.fn()
    }))
}))

// Mocking the Player utility
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
        // Isolation de l'instance Pinia pour garantir l'indépendance des tests
        setActivePinia(createPinia())

        fetchSongsMock = vi.fn();

        // Injection de l'espion dans le module api via spyOn pour intercepter les appels du store
        vi.spyOn(itunesModule, 'useITunes').mockReturnValue({
            fetchSongs: fetchSongsMock
        });
        vi.clearAllMocks();
    })

    it('devrait initialiser l\'état avec les valeurs par défaut', () => {
        const store = useSongStore()
        expect(store.songs).toEqual([])
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
        expect(store.sortKey).toBe('trackName')
        expect(store.sortOrder).toBe('asc')
    })

    it('devrait hydrater le store après une résolution API fructueuse', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        // Mock de données iTunes conformes aux critères de filtrage du mapper
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

    it('devrait capturer les exceptions et mettre à jour l\'état d\'erreur', async () => {
        // Interception de console.error pour maintenir la propreté du flux de sortie (stdout)
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const store = useSongStore()
        const { fetchSongs } = useITunes()

        fetchSongs.mockRejectedValue(new Error('API Down'))

        await store.search('test')

        expect(store.loading).toBe(false)
        expect(store.error).toBe('Unable to load songs. Please check your connection.')
        expect(store.songs).toEqual([])
        expect(consoleSpy).toHaveBeenCalled()

        consoleSpy.mockRestore()
    })

    it('devrait réordonner la collection existante via setSort sans appel API', () => {
        const store = useSongStore()

        const mockData = [
            { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'Zebra' },
            { wrapperType: 'track', kind: 'song', trackId: 2, trackName: 'Apple' }
        ]

        store.songs = mockData

        // Exécution de la logique de tri interne (mapAndSortSongs)
        store.setSort('trackName', 'asc')

        expect(store.songs.length).toBe(2)
        expect(store.songs[0].trackName).toBe('Apple')
        expect(store.songs[1].trackName).toBe('Zebra')
    })

    it('devrait synchroniser l\'état réactif loading durant le cycle de vie asynchrone', async () => {
        const store = useSongStore()
        const { fetchSongs } = useITunes()

        let resolvePromise
        fetchSongs.mockReturnValue(new Promise((res) => { resolvePromise = res }))

        const searchPromise = store.search('test')

        // Vérification de l'état pendant la latence réseau simulée
        expect(store.loading).toBe(true)

        resolvePromise([])
        await searchPromise

        // Vérification de l'état post-traitement
        expect(store.loading).toBe(false)
    })

    it('devrait lancer la lecture d\'une chanson et mettre à jour l\'état', () => {
        const store = useSongStore()
        const mockSong = { trackId: 123, previewUrl: 'http://test.mp3' }

        store.togglePlay(mockSong)

        expect(player.play).toHaveBeenCalledWith(mockSong.previewUrl, expect.any(Function))
        expect(store.isPlaying).toBe(true)
        expect(store.currentSongId).toBe(123)
    })

    it('devrait mettre en pause si la même chanson est déjà en lecture', () => {
        const store = useSongStore()
        const mockSong = { trackId: 123, previewUrl: 'http://test.mp3' }

        // Simuler une chanson déjà en cours
        store.isPlaying = true
        store.$patch({ currentSongId: 123 });

        store.togglePlay(mockSong)

        expect(player.pause).toHaveBeenCalled()
        expect(store.isPlaying).toBe(false)
    })

    it('devrait passer à la chanson suivante', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 1 }); // Chanson actuelle est la première

        store.next()

        expect(store.currentSongId).toBe(2)
        expect(player.play).toHaveBeenCalled()
    })

    it('devrait recommencer la chanson actuelle via "prev" si le temps > 3s', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 2 });

        // Simuler que 5 secondes se sont écoulées
        player.getCurrentTime.mockReturnValue(5)

        store.prev()

        expect(player.stop).toHaveBeenCalled()
        expect(store.currentSongId).toBe(2) // Reste sur la même chanson
        expect(player.play).toHaveBeenCalled()
    })

    it('devrait passer à la chanson précédente via "prev" si le temps < 3s', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1 }, { trackId: 2 }]
        store.$patch({ currentSongId: 2 });

        // Simuler que seulement 1 seconde s'est écoulée
        player.getCurrentTime.mockReturnValue(1)

        store.prev()

        expect(store.currentSongId).toBe(1) // Passe à la précédente
    })

    it('devrait mettre à jour la position de lecture via seek', () => {
        const store = useSongStore()

        store.seek(15)

        expect(player.seek).toHaveBeenCalledWith(15)
        expect(store.currentTime).toBe(15)
    })

    it('devrait calculer correctement currentIndex', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 10 }, { trackId: 20 }, { trackId: 30 }]

        store.$patch({ currentSongId: 20 });
        expect(store.currentIndex).toBe(1)

        store.$patch({ currentSongId: 99 }); // ID inexistant
        expect(store.currentIndex).toBe(-1)
    })
})