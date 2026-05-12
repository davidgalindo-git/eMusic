import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import PlaylistSongCard from "../../../../src/components/playlist/page/PlaylistSongCard.vue";

const vuetify = createVuetify({ components, directives })

describe('PlaylistSongCard.vue - Collection Item Interface', () => {
    const mockSong = {
        trackId: 77,
        trackName: 'Midnight City',
        artistName: 'M83',
        artworkUrl: 'https://example.com/m83.jpg'
    }

    const globalPlugins = {
        global: {
            plugins: [vuetify, createTestingPinia()],
            stubs: { AddToPlaylistButton: true, RemoveFromPlaylistButton: true }
        }
    }

    // ... (Your existing 'toggle-play' and 'bridge remove-song' tests go here)

    it('should suppress "toggle-play" when interacting with the action area', async () => {
        const wrapper = mount(PlaylistSongCard, {
            props: { song: mockSong },
            ...globalPlugins
        })

        /**
         * Event Bubbling Guard.
         * Verifies that the @click.stop on the action container correctly
         * prevents the card's root click handler from firing.
         */
        const actionArea = wrapper.find('.d-flex.align-center')
        await actionArea.trigger('click')

        expect(wrapper.emitted('toggle-play')).toBeUndefined()
    })

    it('should render the drag handle icon specifically in Edit Mode', async () => {
        const wrapper = mount(PlaylistSongCard, {
            props: { song: mockSong, isEditMode: true },
            ...globalPlugins
        })

        /**
         * Drag-and-Drop Affordance Validation.
         * Confirms that the grab-handle icon is present to signal
         * reordering capabilities to the user.
         */
        const dragIcon = wrapper.find('.drag-handle')
        expect(dragIcon.exists()).toBe(true)
        expect(dragIcon.attributes('style')).toContain('cursor: grab')
    })

    it('should hide the drag handle and removal button when NOT in Edit Mode', () => {
        const wrapper = mount(PlaylistSongCard, {
            props: { song: mockSong, isEditMode: false },
            ...globalPlugins
        })

        /**
         * UI Cleanliness Check.
         * Ensures that destructive or administrative controls are
         * strictly hidden during standard playback/viewing mode.
         */
        expect(wrapper.find('.drag-handle').exists()).toBe(false)
        expect(wrapper.findComponent({ name: 'RemoveFromPlaylistButton' }).exists()).toBe(false)
    })

    it('should correctly bind song metadata to the card display', () => {
        const wrapper = mount(PlaylistSongCard, {
            props: { song: mockSong },
            ...globalPlugins
        })

        /**
         * Prop-to-UI Mapping.
         * Confirms the card displays the correct title, artist,
         * and cover art URL provided by the song prop.
         */
        const cardItem = wrapper.findComponent({ name: 'v-card-item' })
        expect(cardItem.props('title')).toBe('Midnight City')
        expect(cardItem.props('subtitle')).toBe('M83')

        const img = wrapper.findComponent({ name: 'v-img' })
        expect(img.props('src')).toBe('https://example.com/m83.jpg')
    })
})