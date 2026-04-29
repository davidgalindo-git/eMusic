import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import SongCard from '../../src/components/songs/SongCard.vue'

// Initialisation de Vuetify
const vuetify = createVuetify({ components, directives })

describe('SongCard.vue', () => {
    // Objet de données factices (Mock Data) conforme à ce que fournit votre mapper
    const mockSong = {
        trackName: 'Test Song',
        artistName: 'Test Artist',
        artworkUrl: 'https://example.com/image.jpg'
    }

    it('devrait afficher le titre et le nom de l\'artiste reçus en props', () => {
        const wrapper = mount(SongCard, {
            props: {
                song: mockSong
            },
            global: {
                plugins: [vuetify]
            }
        })

        // On vérifie que le texte du titre et de l'artiste est présent dans le rendu
        expect(wrapper.text()).toContain('Test Song')
        expect(wrapper.text()).toContain('Test Artist')
    })

    it('devrait afficher l\'image de l\'album avec la bonne source', () => {
        const wrapper = mount(SongCard, {
            props: {
                song: mockSong
            },
            global: {
                plugins: [vuetify]
            }
        })

        // On cherche le composant v-img (ou la balise img générée par Vuetify)
        const img = wrapper.find('img')
        expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    })

    it('devrait appliquer la classe CSS song-card', () => {
        const wrapper = mount(SongCard, {
            props: {
                song: mockSong
            },
            global: {
                plugins: [vuetify]
            }
        })

        // Vérifie que la classe CSS personnalisée est bien appliquée au v-card
        expect(wrapper.classes()).toContain('song-card')
    })
})