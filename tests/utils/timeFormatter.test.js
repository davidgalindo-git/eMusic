import { describe, it, expect } from 'vitest'
import { timeFormatter } from '../../src/utils/timeFormatter.js'

/**
 * Unit test suite for the timeFormatter utility.
 * Validates temporal normalization and string interpolation logic for media playback.
 */
describe('timeFormatter utility', () => {

    it('should return a zeroed timestamp for a zero-second input', () => {
        // Assert baseline padding for empty duration.
        expect(timeFormatter(0)).toBe('00:00')
    })

    it('should fallback to a zeroed timestamp upon receiving null or undefined', () => {
        /**
         * Type safety validation.
         * Ensures the utility handles non-numeric falsy inputs without runtime exceptions.
         */
        expect(timeFormatter(null)).toBe('00:00')
        expect(timeFormatter(undefined)).toBe('00:00')
    })

    it('should apply leading-zero padding for durations under one minute', () => {
        expect(timeFormatter(5)).toBe('00:05')
        expect(timeFormatter(45)).toBe('00:45')
    })

    it('should correctly calculate and format integer minute durations', () => {
        // Validation of exact divisor logic (60s intervals).
        expect(timeFormatter(60)).toBe('01:00')
        expect(timeFormatter(600)).toBe('10:00')
    })

    it('should interpolate remaining seconds alongside calculated minutes', () => {
        /**
         * Scenario: Standard track durations.
         * Verifies modulo operation and string concatenation integrity.
         */
        expect(timeFormatter(30)).toBe('00:30')
        expect(timeFormatter(245)).toBe('04:05')
    })

    it('should apply a floor operation to floating-point inputs', () => {
        /**
         * Precision handling.
         * store.currentTime often emits high-precision floats;
         * the utility must truncate decimals to the nearest second.
         */
        expect(timeFormatter(12.9)).toBe('00:12')
        expect(timeFormatter(61.2)).toBe('01:01')
    })

    it('should aggregate overflow minutes for durations exceeding one hour', () => {
        /**
         * Boundary behavior validation.
         * 3665 seconds = 1 hour, 1 minute, 5 seconds.
         * The current implementation uses a MM:SS schema, aggregating hours into the minute field.
         */
        expect(timeFormatter(3665)).toBe('61:05')
    })
})