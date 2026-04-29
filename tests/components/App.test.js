import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from '../../src/App.vue'
import { useSongStore } from '../../src/store/useSongStore'

// Initialisation de Vuetify pour l'environnement de test
const vuetify = createVuetify({ components, directives })

describe('App.vue - Test d\'Intégration', () => {
    beforeEach(() => {
        // Préparation d'une instance Pinia propre pour chaque test
        setActivePinia(createPinia())
    })

    it('devrait appeler la méthode de recherche du store quand SearchBar émet l\'événement "search"', async () => {
        // 1. Montage du composant App avec les plugins nécessaires
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify]
            }
        })

        // 2. Récupération de l'instance du store et création d'un espion (spy) sur la méthode search
        const store = useSongStore()
        const searchSpy = vi.spyOn(store, 'search')

        // 3. Récupération du composant SearchBar et déclenchement manuel de son événement personnalisé
        // (Simule l'utilisateur qui valide une recherche dans le composant enfant)
        const searchBar = wrapper.findComponent({ name: 'SearchBar' })
        await searchBar.vm.$emit('search', 'Daft Punk')

        // 4. Vérification que la méthode search du store a été appelée avec le bon terme
        expect(searchSpy).toHaveBeenCalledWith('Daft Punk')
    })

    it('devrait afficher correctement les composants enfants au démarrage', () => {
        const wrapper = mount(App, {
            global: {
                plugins: [vuetify]
            }
        })

        // Vérifie la présence des composants structurels dans le DOM
        expect(wrapper.findComponent({ name: 'SearchBar' }).exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'SongContainer' }).exists()).toBe(true)
    })
})