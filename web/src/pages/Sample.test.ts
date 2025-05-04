import { describe, it, expect } from 'vitest';
import { sum } from './Sample';

describe('sum', () => {
    it('should return the sum of two positive numbers', () => {
        expect(sum(2, 3)).toBe(5);
    });

    it('should return the sum of a positive and a negative number', () => {
        expect(sum(5, -3)).toBe(2);
    });

    it('should return the sum of two negative numbers', () => {
        expect(sum(-4, -6)).toBe(-10);
    });

    it('should return 0 when both numbers are 0', () => {
        expect(sum(0, 0)).toBe(0);
    });

    it('should return the correct sum when one number is 0', () => {
        expect(sum(0, 7)).toBe(7);
        expect(sum(9, 0)).toBe(9);
    });
});