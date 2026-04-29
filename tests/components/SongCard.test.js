import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SongCard from '../../src/components/songs/SongCard.vue'

/**
 * Suite de tests unitaires pour le composant SongCard.vue.
 * Vérifie le rendu atomique basé sur les propriétés (props) transmises.
 */
const vuetify = createVuetify({ components, directives })

describe('SongCard.vue - Rendu unitaire', () => {
    // Jeu de données simulées (Mock) conforme à l'interface métier
    const mockSong = {
        trackName: 'Test Song',
        artistName: 'Test Artist',
        artworkUrl: 'https://example.com/image.jpg'
    }

    it('devrait restituer textuellement les métadonnées de la piste', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: { plugins: [vuetify] }
        })

        // Validation de la présence des nœuds textuels attendus
        expect(wrapper.text()).toContain('Test Song')
        expect(wrapper.text()).toContain('Test Artist')
    })

    it('devrait assigner l\'URL source correcte à l\'élément d\'image', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: { plugins: [vuetify] }
        })

        // Localisation de l'élément img généré par le composant v-img
        const img = wrapper.find('img')
        expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('devrait appliquer la classe stylistique spécifiée à la racine du composant', () => {
        const wrapper = mount(SongCard, {
            props: { song: mockSong },
            global: { plugins: [vuetify] }
        })

        // Vérification de la conformité des attributs de classe CSS
        expect(wrapper.classes()).toContain('song-card')
    })
})