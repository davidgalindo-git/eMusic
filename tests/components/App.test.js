import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from '../../src/App.vue'
import { useSongStore } from '../../src/store/useSongStore'

/**
 * Suite de tests d'intégration pour le composant racine App.vue.
 * Vérifie la communication inter-composants et la liaison avec le store Pinia.
 */
const vuetify = createVuetify({ components, directives })

describe('App.vue - Intégration', () => {
    beforeEach(() => {
        // Isolation de l'état global avant chaque scénario
        setActivePinia(createPinia())
    })

    it('devrait déclencher l\'action de recherche du store suite à l\'émission de l\'événement SearchBar', async () => {
        // Montage du composant racine avec injection des dépendances globales (Vuetify)
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify]
            }
        })

        // Initialisation de l'instance du store et interception de la méthode de recherche
        const store = useSongStore()
        const searchSpy = vi.spyOn(store, 'search')

        // Simulation de l'interaction utilisateur via l'émission d'un événement personnalisé par le composant enfant
        const searchBar = wrapper.findComponent({ name: 'SearchBar' })
        await searchBar.vm.$emit('search', 'Daft Punk')

        // Validation du flux de données montant : Composant -> App -> Store
        expect(searchSpy).toHaveBeenCalledWith('Daft Punk')
    })

    it('devrait assurer la présence des composants structurels au montage', () => {
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify]
            }
        })

        // Vérification de l'intégrité de l'arborescence DOM (composants critiques)
        expect(wrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'SongContainer' }).exists()).toBe(true)
    })
})