import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import EditModeButton from "../../../src/components/playlist/EditModeButton.vue";

const vuetify = createVuetify({ components, directives })

describe('EditModeButton.vue - UI State Toggle', () => {

    it('should display the pencil icon when in viewing mode (isEditMode: false)', () => {
        const wrapper = mount(EditModeButton, {
            props: { isEditMode: false },
            global: { plugins: [vuetify] }
        })

        /**
         * State-to-Icon Mapping.
         * Verifies that the component provides the 'pencil' visual cue
         * when the edit state is inactive.
         */
        const btn = wrapper.findComponent({ name: 'v-btn' })
        expect(btn.props('icon')).toBe('mdi-pencil')
        expect(wrapper.attributes('title')).toBe('Edit Mode')
    })

    it('should display the close icon when in editing mode (isEditMode: true)', () => {
        const wrapper = mount(EditModeButton, {
            props: { isEditMode: true },
            global: { plugins: [vuetify] }
        })

        /**
         * State-to-Icon Mapping.
         * Verifies that the component switches to a 'close' icon
         * to signify a cancel/exit action.
         */
        const btn = wrapper.findComponent({ name: 'v-btn' })
        expect(btn.props('icon')).toBe('mdi-close')
        expect(wrapper.attributes('title')).toContain('Close Edit Mode')
    })

    it('should emit "toggle-edit-mode" when clicked', async () => {
        const wrapper = mount(EditModeButton, {
            props: { isEditMode: false },
            global: { plugins: [vuetify] }
        })

        /**
         * Signal Propagation.
         * Simulates interaction to ensure the parent is notified
         * of the requested state change.
         */
        await wrapper.find('button').trigger('click')

        expect(wrapper.emitted()).toHaveProperty('toggle-edit-mode')
        expect(wrapper.emitted('toggle-edit-mode')).toHaveLength(1)
    })
})