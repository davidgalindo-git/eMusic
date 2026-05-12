import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {usePlaylistStore} from "../../../../src/store/usePlaylistStore.js";
import PlaylistContainer from "../../../../src/components/playlist/menu/PlaylistContainer.vue";
import PlaylistCard from "../../../../src/components/playlist/menu/PlaylistCard.vue";

const vuetify = createVuetify({ components, directives })

describe('PlaylistContainer.vue - Collection Orchestrator', () => {
    let store;

    beforeEach(() => {
        const pinia = createTestingPinia({ stubActions: false })
        store = usePlaylistStore()
        // Mock initial state
        store.playlists = [
            { id: 1, name: 'Gym Mix', songs: [] },
            { id: 2, name: 'Focus', songs: [] }
        ]
    })

    it('should render a PlaylistCard for every entry in the store', () => {
        const wrapper = mount(PlaylistContainer, {
            global: { plugins: [vuetify, createTestingPinia()] }
        })

        const cards = wrapper.findAllComponents(PlaylistCard)
        expect(cards).toHaveLength(2)
    })

    it('should emit "show-playlist" when a card is clicked in standard mode', async () => {
        const wrapper = mount(PlaylistContainer, {
            global: { plugins: [vuetify, createTestingPinia()] }
        })

        const firstCard = wrapper.findComponent(PlaylistCard)

        /**
         * Event Routing.
         * In standard mode (isEditMode: false), selection triggers
         * a drill-down event to the parent view.
         */
        await firstCard.vm.$emit('select', 1)

        expect(wrapper.emitted('show-playlist')[0]).toEqual([1])
    })

    it('should enter rename mode for a specific card when clicked during Edit Mode', async () => {
        const wrapper = mount(PlaylistContainer, {
            global: { plugins: [vuetify, createTestingPinia()] }
        })

        // 1. Enter Edit Mode
        await wrapper.findComponent({ name: 'EditModeButton' }).vm.$emit('toggle-edit-mode')

        // 2. Select a playlist to rename
        const firstCard = wrapper.findComponent(PlaylistCard)
        await firstCard.vm.$emit('select', 1)

        /**
         * Prop Synchronization.
         * Verifies that the container correctly calculates the
         * 'is-currently-renaming' boolean for the targeted child.
         */
        expect(firstCard.props('isCurrentlyRenaming')).toBe(true)
    })

    it('should delegate rename and delete actions to the playlistStore', async () => {
        // 1. Mount with Testing Pinia
        const wrapper = mount(PlaylistContainer, {
            global: {
                plugins: [vuetify, createTestingPinia()]
            }
        })

        // 2. Grab the store instance after mounting
        const store = usePlaylistStore()
        const firstCard = wrapper.findComponent(PlaylistCard)

        // 3. Trigger the child component's event
        await firstCard.vm.$emit('rename', 1, 'New Name')

        // 4. Assert directly on the store's action
        expect(store.renamePlaylist).toHaveBeenCalledWith(1, 'New Name')
    })

    it('should render a placeholder message when the playlist collection is empty', async () => {
        const wrapper = mount(PlaylistContainer, {
            global: {
                plugins: [vuetify, createTestingPinia()]
            }
        })
        const store = usePlaylistStore()
        store.playlists = [] // Empty the store

        await wrapper.vm.$nextTick()

        /**
         * Fallback UI Validation.
         * Ensures that the component provides user feedback when no data
         * is available, preventing an empty white-screen state.
         */
        expect(wrapper.text()).toContain('No playlists yet')
    })
})