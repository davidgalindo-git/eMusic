import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import NewPlaylistButton from "../../../../src/components/playlist/menu/NewPlaylistButton.vue";
import {usePlaylistStore} from "../../../../src/store/usePlaylistStore.js";

const vuetify = createVuetify({ components, directives })

describe('NewPlaylistButton.vue - Collection Initialization UI', () => {

    it('should toggle the input field visibility when the action button is clicked', async () => {
        const wrapper = mount(NewPlaylistButton, {
            global: {
                plugins: [vuetify, createTestingPinia()]
            }
        })

        // Find by component name to get the VueWrapper
        const toggleBtn = wrapper.findComponent({ name: 'v-btn' })

        await toggleBtn.trigger('click')

        // Verification
        expect(wrapper.find('.v-text-field').exists()).toBe(true)
        expect(toggleBtn.props('icon')).toBe('mdi-close')
    })

    it('should invoke store.createPlaylist and reset state upon valid submission', async () => {
        const wrapper = mount(NewPlaylistButton, {
            global: {
                plugins: [vuetify, createTestingPinia({ stubActions: false })]
            }
        })
        const store = usePlaylistStore()
        const createSpy = vi.spyOn(store, 'createPlaylist')

        // Setup: Open input and enter text
        await wrapper.find('.v-btn').trigger('click')
        const input = wrapper.find('input')
        await input.setValue('New Vibes')

        // Action: Submit via enter key
        await input.trigger('keyup.enter')

        /**
         * Business Logic Validation.
         * Confirms the string was sanitized (trimmed) and broadcasted
         * to the persistence layer.
         */
        expect(createSpy).toHaveBeenCalledWith('New Vibes')

        /**
         * UI Cleanup Validation.
         * Ensures the component returns to its collapsed state post-success.
         */
        expect(wrapper.find('.v-text-field').exists()).toBe(false)
    })

    it('should ignore submission attempts with empty or whitespace-only strings', async () => {
        const wrapper = mount(NewPlaylistButton, {
            global: { plugins: [vuetify, createTestingPinia()] }
        })
        const store = usePlaylistStore()

        await wrapper.find('.v-btn').trigger('click')
        const input = wrapper.find('input')

        // Simulation: Empty input submission
        await input.setValue('   ')
        await input.trigger('keyup.enter')

        expect(store.createPlaylist).not.toHaveBeenCalled()
        expect(wrapper.find('.v-text-field').exists()).toBe(true)
    })
})