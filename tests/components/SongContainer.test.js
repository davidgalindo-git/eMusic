import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SongContainer from '../../src/components/songs/SongContainer.vue'
import { useSongStore } from '../../src/store/useSongStore'

/**
 * Suite de tests d'intégration pour SongContainer.vue.
 * Vérifie le rendu conditionnel basé sur l'état réactif du store Pinia.
 */
const vuetify = createVuetify({ components, directives })

describe('SongContainer.vue - Rendu dynamique', () => {
    beforeEach(() => {
        // Initialisation d'une instance Pinia isolée
        setActivePinia(createPinia())
    })

    it('devrait afficher le message "No songs found" lorsque la collection est vide', () => {
        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        // Vérification de la présence des éléments textuels de l'état vide
        expect(wrapper.text()).toContain('No songs found')
        expect(wrapper.find('.v-icon').exists()).toBe(true)
    })

    it('devrait instancier le bon nombre de composants SongCard selon les données du store', async () => {
        const store = useSongStore()

        // Simulation de l'injection de données dans le store
        store.songs = [
            { trackId: 1, trackName: 'Song 1', artistName: 'Artist 1' },
            { trackId: 2, trackName: 'Song 2', artistName: 'Artist 2' }
        ]

        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        // Localisation des composants enfants SongCard
        const cards = wrapper.findAllComponents({ name: 'SongCard' })

        // Validation du rendu de la liste
        expect(cards).toHaveLength(2)
        expect(wrapper.text()).not.toContain('No songs found')
    })

    it('devrait assurer la réactivité de la grille (v-row et v-col)', () => {
        const store = useSongStore()
        store.songs = [{ trackId: 1, trackName: 'Song 1' }]

        const wrapper = mount(SongContainer, {
            global: {
                plugins: [vuetify]
            }
        })

        // Vérification de l'utilisation des composants de mise en page Vuetify
        expect(wrapper.findComponent({ name: 'VRow' }).exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'VCol' }).exists()).toBe(true)
    })
})