import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { usePlaylistStore } from "../../../../src/store/usePlaylistStore.js";
import { useSongStore } from "../../../../src/store/useSongStore.js";
import PlaylistSongContainer from "../../../../src/components/playlist/page/PlaylistSongContainer.vue";
import PlaylistSongCard from "../../../../src/components/playlist/page/PlaylistSongCard.vue";

const vuetify = createVuetify({ components, directives })

describe('PlaylistSongContainer.vue - Feature Orchestrator', () => {

    /**
     * @test Reactive Data Synchronization
     * @description Validates the component's internal 'immediate' watcher.
     * Ensures local state (editName) is initialized from the store's computed getter
     * (activePlaylistName) during the setup phase.
     */
    it('should synchronize the playlist name with a local ref', async () => {
        const wrapper = mount(PlaylistSongContainer, {
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        initialState: {
                            playlistStore: {
                                playlists: [{ id: 1, name: 'Chill', songs: [] }],
                                selectedPlaylistId: 1
                            }
                        }
                    })
                ]
            }
        })

        expect(wrapper.find('h2').text()).toBe('Chill')
    })

    /**
     * @test Event Interception and Store Delegation
     * @description Verifies the 'Bridge' pattern. The container must intercept child
     * events and orchestrate multi-store side effects: hydrating the playback queue
     * via SongStore while maintaining context from PlaylistStore.
     */
    it('should update the audio queue and toggle playback when a song is clicked', async () => {
        const wrapper = mount(PlaylistSongContainer, {
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        stubActions: false,
                        initialState: {
                            playlistStore: {
                                playlists: [{ id: 1, name: 'Chill', songs: [{ trackId: 101 }] }],
                                selectedPlaylistId: 1
                            }
                        }
                    })
                ]
            }
        })

        const activeSongStore = useSongStore()
        const setQueueSpy = vi.spyOn(activeSongStore, 'setQueue')
        const togglePlaySpy = vi.spyOn(activeSongStore, 'togglePlay')

        const songCard = wrapper.findComponent(PlaylistSongCard)
        await songCard.vm.$emit('toggle-play', { trackId: 101 })

        expect(setQueueSpy).toHaveBeenCalled()
        expect(togglePlaySpy).toHaveBeenCalled()
    })

    /**
     * @test Conditional Feature Gating (vuedraggable)
     * @description Validates the state-to-attribute mapping for third-party integrations.
     * Uses attribute-level inspection to verify that administrative capabilities (DND)
     * are strictly governed by the isEditMode reactive toggle.
     */
    it('should implement Draggable logic only when isEditMode is enabled', async () => {
        const wrapper = mount(PlaylistSongContainer, {
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        initialState: {
                            playlistStore: {
                                playlists: [{ id: 1, name: 'Chill', songs: [{ trackId: 101 }] }],
                                selectedPlaylistId: 1
                            }
                        }
                    })
                ],
                stubs: { draggable: true }
            }
        })

        const draggable = wrapper.findComponent({ name: 'draggable' })
        expect(draggable.attributes('disabled')).toBe('true')

        await wrapper.findComponent({ name: 'EditModeButton' }).vm.$emit('toggle-edit-mode')
        expect(draggable.attributes('disabled')).toBe('false')
    })

    /**
     * @test Compound State Transition
     * @description Validates a complete transaction lifecycle:
     * Mode Entry -> User Input -> Store Persistence -> State Reset.
     * Ensures 'RenameMode' and 'EditMode' are mutually terminated upon successful persistence.
     */
    it('should persist a rename operation and terminate edit states on success', async () => {
        const wrapper = mount(PlaylistSongContainer, {
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        stubActions: false,
                        initialState: {
                            playlistStore: {
                                playlists: [{ id: 1, name: 'Chill', songs: [{ trackId: 101 }] }],
                                selectedPlaylistId: 1
                            }
                        }
                    })
                ]
            }
        })

        const store = usePlaylistStore()
        const renameSpy = vi.spyOn(store, 'renamePlaylist')

        await wrapper.findComponent({ name: 'EditModeButton' }).vm.$emit('toggle-edit-mode')
        await wrapper.find('.display-info').trigger('click')

        const input = wrapper.find('input')
        await input.setValue('Lo-Fi Work')
        await input.trigger('keyup.enter')

        expect(renameSpy).toHaveBeenCalledWith(1, 'Lo-Fi Work')
        expect(wrapper.find('input').exists()).toBe(false)
    })

    /**
     * @test Clean Exit and Navigation Signaling
     * @description Verifies the 'Destructor' signal. Upon resource deletion, the
     * orchestrator must notify the parent context to prevent 'Ghost State' (viewing
     * a resource that no longer exists in the store).
     */
    it('should emit "deleted-playlist" to signal parent navigation after deletion', async () => {
        const wrapper = mount(PlaylistSongContainer, {
            global: {
                plugins: [
                    vuetify,
                    createTestingPinia({
                        stubActions: false,
                        initialState: {
                            playlistStore: {
                                playlists: [{ id: 1, name: 'Chill', songs: [{ trackId: 101 }] }],
                                selectedPlaylistId: 1
                            }
                        }
                    })
                ]
            }
        })

        await wrapper.findComponent({ name: 'EditModeButton' }).vm.$emit('toggle-edit-mode')
        await wrapper.findComponent({ name: 'DeletePlaylistButton' }).vm.$emit('delete-playlist')

        expect(wrapper.emitted('deleted-playlist')).toBeTruthy()
    })
})