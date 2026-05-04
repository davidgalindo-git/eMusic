import { describe, it, expect } from 'vitest'
import { timeFormatter } from '../../src/utils/timeFormatter.js'

describe('timeFormatter utility', () => {

    it('should format 0 seconds as 00:00', () => {
        expect(timeFormatter(0)).toBe('00:00')
    })

    it('should handle null or undefined by returning 00:00', () => {
        expect(timeFormatter(null)).toBe('00:00')
        expect(timeFormatter(undefined)).toBe('00:00')
    })

    it('should format seconds under a minute correctly', () => {
        expect(timeFormatter(5)).toBe('00:05')
        expect(timeFormatter(45)).toBe('00:45')
    })

    it('should format exact minutes correctly', () => {
        expect(timeFormatter(60)).toBe('01:00')
        expect(timeFormatter(600)).toBe('10:00')
    })

    it('should format minutes and seconds correctly', () => {
        // The iTunes preview classic 30s
        expect(timeFormatter(30)).toBe('00:30')
        // A standard song length
        expect(timeFormatter(245)).toBe('04:05')
    })

    it('should floor decimal values to the nearest second', () => {
        // Use case: store.currentTime is often a float (e.g., 12.678)
        expect(timeFormatter(12.9)).toBe('00:12')
        expect(timeFormatter(61.2)).toBe('01:01')
    })

    it('should handle durations longer than 60 minutes', () => {
        // 3665 seconds = 1 hour, 1 minute, 5 seconds
        // Note: Your current function formats this as 61:05
        expect(timeFormatter(3665)).toBe('61:05')
    })
})