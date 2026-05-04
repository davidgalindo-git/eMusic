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

        // Simulate user typing
        await input.setValue('Discovery')

        // In Vue 3, v-model updates the underlying ref
        expect(wrapper.vm.term).toBe('Discovery')
    })

    it('emits "search" event with the correct term on form submit', async () => {
        const input = wrapper.find('input[type="text"]')
        const form = wrapper.find('form')

        // 1. Set the value
        await input.setValue('Daft Punk')

        // 2. Trigger form submission
        await form.trigger('submit.prevent')

        // 3. Check if event was emitted
        const emitted = wrapper.emitted('search')
        expect(emitted).toBeTruthy()
        expect(emitted[0]).toEqual(['Daft Punk'])
    })

    it('does not emit "search" if the input is empty or only whitespace', async () => {
        const input = wrapper.find('input[type="text"]')
        const form = wrapper.find('form')

        // Case 1: Empty string
        await input.setValue('')
        await form.trigger('submit.prevent')
        expect(wrapper.emitted('search')).toBeFalsy()

        // Case 2: Just spaces
        await input.setValue('   ')
        await form.trigger('submit.prevent')
        expect(wrapper.emitted('search')).toBeFalsy()
    })
})