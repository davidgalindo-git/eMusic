import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import DeletePlaylistButton from '../../../src/components/playlist/DeletePlaylistButton.vue'

const vuetify = createVuetify({ components, directives })

describe('DeletePlaylistButton.vue - UI Action Component', () => {

    it('should correctly render the deletion trigger with appropriate styling', () => {
        const wrapper = mount(DeletePlaylistButton, {
            global: { plugins: [vuetify] }
        })

        /**
         * Visual Integrity Validation.
         * Confirms the button utilizes the 'error' color scheme and
         * displays the correct semantic icon.
         */
        const btn = wrapper.findComponent({ name: 'v-btn' })
        expect(btn.props('color')).toBe('error')
        expect(btn.html()).toContain('mdi-delete')
    })

    it('should broadcast the "delete-playlist" event upon user interaction', async () => {
        const wrapper = mount(DeletePlaylistButton, {
            global: { plugins: [vuetify] }
        })

        /**
         * Event Orchestration.
         * Simulates a discrete click event on the root element.
         */
        await wrapper.find('button').trigger('click')

        /**
         * Emission Validation.
         * Verifies that the component successfully bridged the DOM event
         * to the Vue custom event system.
         */
        expect(wrapper.emitted()).toHaveProperty('delete-playlist')
        expect(wrapper.emitted('delete-playlist')).toHaveLength(1)
    })

    it('should possess a descriptive title for accessibility (a11y)', () => {
        const wrapper = mount(DeletePlaylistButton, {
            global: { plugins: [vuetify] }
        })

        /**
         * Attribute Declaration Integrity.
         * Ensures the component provides necessary contextual hints
         * for screen readers or hover states.
         */
        expect(wrapper.attributes('title')).toBe('Delete Playlist')
    })
})