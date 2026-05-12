import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import PlaylistCard from "../../../../src/components/playlist/menu/PlaylistCard.vue";

const vuetify = createVuetify({ components, directives })

describe('PlaylistCard.vue - Collection Entry Component', () => {
    const mockPlaylist = {
        id: 123,
        name: 'Chill Beats',
        songs: [{}, {}, {}] // 3 tracks
    }

    it('should display the playlist identity and metadata in standard mode', () => {
        const wrapper = mount(PlaylistCard, {
            props: { playlist: mockPlaylist, isCurrentlyRenaming: false },
            global: { plugins: [vuetify] }
        })

        /**
         * Textual Node Validation.
         * Confirms the reactive interpolation of playlist name and
         * derived length of the songs collection.
         */
        expect(wrapper.text()).toContain('Chill Beats')
        expect(wrapper.text()).toContain('3 tracks')
    })

    it('should enter an interactive text-field state when isCurrentlyRenaming is true', async () => {
        const wrapper = mount(PlaylistCard, {
            props: { playlist: mockPlaylist, isCurrentlyRenaming: true },
            global: { plugins: [vuetify] }
        })

        /**
         * Structural State Displacement.
         * Validates the v-if toggle logic that swaps the info div
         * for an input field primitive.
         */
        const input = wrapper.find('input')
        expect(input.exists()).toBe(true)
        expect(input.element.value).toBe('Chill Beats')
    })

    it('should broadcast the "rename" signal with target ID and payload on submission', async () => {
        const wrapper = mount(PlaylistCard, {
            props: { playlist: mockPlaylist, isCurrentlyRenaming: true },
            global: { plugins: [vuetify] }
        })

        const input = wrapper.find('input')
        await input.setValue('Lo-Fi Study')
        await input.trigger('keyup.enter')

        /**
         * Event Payload Integrity.
         * Verifies the component successfully marshals the internal ref
         * and the original prop ID into a single emission.
         */
        expect(wrapper.emitted('rename')[0]).toEqual([123, 'Lo-Fi Study'])
    })

    it('should expose the deletion trigger only when isEditMode is active', async () => {
        const wrapper = mount(PlaylistCard, {
            props: { playlist: mockPlaylist, isEditMode: true },
            global: { plugins: [vuetify], stubs: { DeletePlaylistButton: true } }
        })

        /**
         * Conditional Visibility Logic.
         * Ensures the 'action-area' container is mounted based on the
         * boolean displacement prop.
         */
        expect(wrapper.find('.action-area').exists()).toBe(true)
        expect(wrapper.findComponent({ name: 'DeletePlaylistButton' }).exists()).toBe(true)
    })

    it('should emit "select" when the display info is clicked', async () => {
        const wrapper = mount(PlaylistCard, {
            props: { playlist: mockPlaylist, isCurrentlyRenaming: false },
            global: { plugins: [vuetify] }
        })

        /**
         * User Intent Mapping.
         * Simulates a selection event to trigger the UI context switch
         * in the parent container.
         */
        await wrapper.find('.display-info').trigger('click')
        expect(wrapper.emitted('select')[0]).toEqual([123])
    })
})