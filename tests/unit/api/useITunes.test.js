import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useITunes } from '../../../src/api/useITunes.js'

/**
 * Suite de tests unitaires pour le composable useITunes.
 * Vérifie l'encapsulation de la logique d'appel à l'API iTunes et la gestion des flux réseaux.
 */
describe('useITunes', () => {
    let fetchMock

    beforeEach(() => {
        // Substitution de la méthode fetch globale par un espion (spy)
        fetchMock = vi.fn()
        global.fetch = fetchMock
    })

    afterEach(() => {
        // Réinitialisation des mocks pour garantir l'idempotence des tests
        vi.restoreAllMocks()
    })

    describe('fetchSongs', () => {
        it('devrait retourner les pistes avec succès pour un terme valide', async () => {
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

            // Validation de la construction de l'URL et de la récupération des données
            expect(fetchMock).toHaveBeenCalledWith(
                'https://itunes.apple.com/search?term=test&media=music&limit=20'
            )
            expect(result).toEqual(mockData.results)
        })

        it('devrait encoder les composants URI dans le terme de recherche', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            await fetchSongs('test & special chars')

            // Vérifie que les caractères réservés sont correctement échappés
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('test%20%26%20special%20chars')
            )
        })

        it('devrait lever une exception en cas de réponse HTTP non-conforme', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            })

            const { fetchSongs } = useITunes()

            // Vérifie la propagation de l'erreur avec le statut HTTP
            await expect(fetchSongs('test')).rejects.toThrow('iTunes API Error: Not Found')
        })

        it('devrait propager les erreurs réseaux natives', async () => {
            fetchMock.mockRejectedValueOnce(new Error('Network error'))

            const { fetchSongs } = useITunes()

            await expect(fetchSongs('test')).rejects.toThrow('Network error')
        })

        it('devrait retourner une collection vide si aucun résultat n\'est trouvé', async () => {
            fetchMock.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()
            const result = await fetchSongs('nonexistentartist12345')

            expect(result).toEqual([])
        })

        it('devrait traiter correctement divers formats de caractères spéciaux', async () => {
            const specialTerms = ['AC/DC', 'R&B', 'hip-hop', 'björk']

            fetchMock.mockResolvedValue({
                ok: true,
                json: async () => ({ results: [] })
            })

            const { fetchSongs } = useITunes()

            for (const term of specialTerms) {
                await fetchSongs(term)
                // Validation de l'encodage dynamique pour chaque cas
                expect(fetchMock).toHaveBeenCalledWith(
                    expect.stringContaining(encodeURIComponent(term))
                )
            }
        })
    })
})