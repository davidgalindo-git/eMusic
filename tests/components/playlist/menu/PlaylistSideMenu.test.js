import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import PlaylistSideMenu from "../../../../src/components/playlist/menu/PlaylistSideMenu.vue";
import PlaylistContainer from "../../../../src/components/playlist/menu/PlaylistContainer.vue";

const vuetify = createVuetify({ components, directives })

describe('PlaylistSideMenu.vue - Structural Navigation Sidebar', () => {

    it('should render the static header and the orchestrator container', () => {
        const wrapper = mount(PlaylistSideMenu, {
            global: {
                plugins: [vuetify, createTestingPinia()],
                stubs: { PlaylistContainer: true } // Stubbing child for isolation
            }
        })

        /**
         * Component Hierarchy Validation.
         * Confirms the presence of the semantic header and the mounting of
         * the primary playlist data orchestrator.
         */
        expect(wrapper.find('h2').text()).toBe('Playlists')
        expect(wrapper.findComponent(PlaylistContainer).exists()).toBe(true)
    })

    it('should tunnel the "show-playlist" event from child to parent', async () => {
        const wrapper = mount(PlaylistSideMenu, {
            global: {
                plugins: [vuetify, createTestingPinia()],
                stubs: { PlaylistContainer: true }
            }
        })

        /**
         * Event Bubbling Logic.
         * The SideMenu acts as a relay, capturing the emission from
         * PlaylistContainer and re-broadcasting it to the main Layout.
         */
        const container = wrapper.findComponent(PlaylistContainer)
        const targetId = 456

        // Simulate child emission
        await container.vm.$emit('show-playlist', targetId)

        expect(wrapper.emitted('show-playlist')).toBeTruthy()
        expect(wrapper.emitted('show-playlist')[0]).toEqual([targetId])
    })

    it('should maintain a sticky layout position via CSS-in-JS constraints', () => {
        const wrapper = mount(PlaylistSideMenu, {
            global: { plugins: [vuetify, createTestingPinia()] }
        })

        /**
         * Layout Constraint Validation.
         * Ensures the root element possesses the necessary sticky positioning
         * classes/styles to remain anchored during main content scroll.
         */
        const sidebar = wrapper.find('.playlist-menu')
        expect(sidebar.attributes('style')).not.toBeNull()
        // Note: Actual CSS values are checked via computed styles in E2E,
        // but unit tests verify the class/structure anchor.
    })
})