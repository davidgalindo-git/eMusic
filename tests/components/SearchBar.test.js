import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import SearchBar from '../../src/components/search/SearchBar.vue'

describe('SearchBar.vue', () => {
    let wrapper

    beforeEach(() => {
        wrapper = mount(SearchBar)
    })

    it('updates the term ref when text is typed', async () => {
        const input = wrapper.find('input[type="text"]')

        /**
         * Synchronize input value with component state.
         * Verifies two-way data binding (v-model) integrity.
         */
        await input.setValue('Discovery')

        expect(wrapper.vm.term).toBe('Discovery')
    })

    it('emits "search" event with the correct term on form submit', async () => {
        const input = wrapper.find('input[type="text"]')
        const form = wrapper.find('form')

        // State mutation via input injection.
        await input.setValue('Daft Punk')

        // Dispatch submit event; intercept default browser behavior.
        await form.trigger('submit.prevent')

        // Assert event bus emission and payload accuracy.
        const emitted = wrapper.emitted('search')
        expect(emitted).toBeTruthy()
        expect(emitted[0]).toEqual(['Daft Punk'])
    })

    it('does not emit "search" if the input is empty or only whitespace', async () => {
        const input = wrapper.find('input[type="text"]')
        const form = wrapper.find('form')

        // Condition A: Null/Empty string validation.
        await input.setValue('')
        await form.trigger('submit.prevent')
        expect(wrapper.emitted('search')).toBeFalsy()

        // Condition B: Whitespace-only string validation via trim() logic.
        await input.setValue('   ')
        await form.trigger('submit.prevent')
        expect(wrapper.emitted('search')).toBeFalsy()
    })
})