import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import RemoveFromPlaylistButton from "../../../../src/components/playlist/page/RemoveFromPlaylistButton.vue";

const vuetify = createVuetify({ components, directives })

describe('RemoveFromPlaylistButton.vue - Atomic Action Component', () => {

    /**
     * @test Static Visual Integrity
     * @description Ensures the component renders as a semantic destructive action.
     * Validates that the Vuetify VBtn is configured with the correct 'error' intent
     * and 'mdi-delete' iconography for UX consistency.
     */
    it('should render with correct visual properties and iconography', () => {
        const wrapper = mount(RemoveFromPlaylistButton, {
            global: { plugins: [vuetify] }
        })

        const btn = wrapper.findComponent({ name: 'v-btn' })

        expect(btn.exists()).toBe(true)
        expect(btn.props('color')).toBe('error')
        expect(btn.find('.v-icon').classes()).toContain('mdi-delete')
    })

    /**
     * @test Event Tunneling Lifecycle
     * @description Validates the component's role as a Functional Proxy.
     * The internal 'handleClick' method must successfully propagate the native
     * click event into a scoped 'remove-song' emission for the parent orchestrator.
     */
    it('should emit "remove-song" when the button is clicked', async () => {
        const wrapper = mount(RemoveFromPlaylistButton, {
            global: { plugins: [vuetify] }
        })

        // Act: Trigger native click event
        await wrapper.find('button').trigger('click')

        /**
         * Emission Verification.
         * Confirms the component adheres to the "Props Down, Events Up"
         * architectural pattern.
         */
        expect(wrapper.emitted()).toHaveProperty('remove-song')
        expect(wrapper.emitted('remove-song')).toHaveLength(1)
    })

    /**
     * @test Accessibility (A11y) Metadata
     * @description Ensures the component provides sufficient context for assistive
     * technologies despite being a purely icon-based control.
     */
    it('should possess a descriptive title attribute for screen readers', () => {
        const wrapper = mount(RemoveFromPlaylistButton, {
            global: { plugins: [vuetify] }
        })

        const btnElement = wrapper.find('button')
        expect(btnElement.attributes('title')).toBe('Remove Song')
    })
})