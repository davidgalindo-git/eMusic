import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import AddToPlaylistButton from "../../src/components/AddToPlaylistButton.vue";
import { usePlaylistStore } from "../../src/store/usePlaylistStore.js";

const vuetify = createVuetify({ components, directives })

describe('AddToPlaylistButton.vue - Feature Access Point', () => {

    const mockSong = { trackId: 101, trackName: 'Test Song' }

    /**
     * @test Prototypical Collection Projection
     * @description Validates the synchronization between the Pinia state layer and
     * the transient UI. Verifies that the VMenu correctly iterates the 'playlists'
     * collection to produce N list-item nodes within the global document scope.
     */
    it('should render a list item for every available playlist', async () => {
        const wrapper = mount(AddToPlaylistButton, {
            attachTo: document.body,
            props: { song: mockSong },
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        initialState: {
                            playlistStore: {
                                playlists: [
                                    { id: 1, name: 'Rock' },
                                    { id: 2, name: 'Jazz' }
                                ]
                            }
                        }
                    })
                ]
            }
        })

        const btn = wrapper.find('button')
        await btn.trigger('click')

        /**
         * Teleportation Discovery.
         * Components utilizing the VOverlay system physically detach their content
         * from the component root. Global DOM interrogation is required to verify
         * nodes that have escaped the Virtual DOM wrapper.
         */
        const items = document.querySelectorAll('.v-list-item')

        expect(items.length).toBe(2)
        expect(items[0].textContent).toContain('Rock')

        wrapper.unmount()
    })

    /**
     * @test Command Pattern Execution & Parameter Integrity
     * @description Verifies the invocation of the persistence layer. Ensures that the
     * 'addToPlaylist' action is dispatched with a compound payload consisting of
     * the target identifier (playlistId) and the contextual entity (mockSong).
     */
    it('should trigger store.addToPlaylist with correct params on selection', async () => {
        const wrapper = mount(AddToPlaylistButton, {
            attachTo: document.body,
            props: { song: mockSong },
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        stubActions: false,
                        initialState: {
                            playlistStore: {
                                playlists: [
                                    {
                                        id: 5,
                                        name: 'Favs',
                                        songs: []
                                    }
                                ]
                            }
                        }
                    })
                ]
            }
        })

        const store = usePlaylistStore()
        const addToPlaylistSpy = vi.spyOn(store, 'addToPlaylist')

        await wrapper.find('button').trigger('click')
        const listItem = document.querySelector('.v-list-item')

        /**
         * Trigger Interface.
         * Simulation of a native click event on the portalled list-item to
         * trigger the handlePlaylistClick bridge function.
         */
        await listItem.click()

        expect(addToPlaylistSpy).toHaveBeenCalledWith(5, mockSong)
        wrapper.unmount()
    })

    /**
     * @test Null-State UI Branching
     * @description Validates the 'v-if' conditional branching logic when the
     * data source is an empty set. Ensures the component maintains visual
     * affordance by rendering a human-readable empty-state signal.
     */
    it('should display empty state message when no playlists exist', async () => {
        const wrapper = mount(AddToPlaylistButton, {
            attachTo: document.body,
            props: { song: mockSong },
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        initialState: {
                            playlistStore: { playlists: [] }
                        }
                    })
                ]
            }
        })

        await wrapper.find('button').trigger('click')

        /**
         * Semantic Class Inspection.
         * Verification that the text-caption node exists within the portalled list,
         * confirming successful state-driven layout mutation.
         */
        const emptyState = document.querySelector('.text-caption')

        expect(emptyState).toBeTruthy()
        expect(emptyState.textContent).toContain('No playlists found')

        wrapper.unmount()
    })
})