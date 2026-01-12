import { describe, it, expect } from 'vitest';
import { formatTime, minutesToMs, msToMinutes, generateId, getTodayDate, getDateDaysAgo } from '../src/utils/time';

describe('formatTime', () => {
    it('formats 0 ms as 00:00', () => {
        expect(formatTime(0)).toBe('00:00');
    });

    it('formats 1 second as 00:01', () => {
        expect(formatTime(1000)).toBe('00:01');
    });

    it('formats 59 seconds as 00:59', () => {
        expect(formatTime(59000)).toBe('00:59');
    });

    it('formats 1 minute as 01:00', () => {
        expect(formatTime(60000)).toBe('01:00');
    });

    it('formats 25 minutes as 25:00', () => {
        expect(formatTime(25 * 60 * 1000)).toBe('25:00');
    });

    it('formats 1 minute 30 seconds as 01:30', () => {
        expect(formatTime(90000)).toBe('01:30');
    });

    it('handles negative values by returning 00:00', () => {
        expect(formatTime(-1000)).toBe('00:00');
    });

    it('rounds up partial seconds', () => {
        expect(formatTime(1500)).toBe('00:02'); // 1.5 seconds rounds up
        expect(formatTime(100)).toBe('00:01');  // 0.1 seconds rounds up
    });
});

describe('minutesToMs', () => {
    it('converts 1 minute to 60000 ms', () => {
        expect(minutesToMs(1)).toBe(60000);
    });

    it('converts 25 minutes to 1500000 ms', () => {
        expect(minutesToMs(25)).toBe(1500000);
    });

    it('converts 0 minutes to 0 ms', () => {
        expect(minutesToMs(0)).toBe(0);
    });
});

describe('msToMinutes', () => {
    it('converts 60000 ms to 1 minute', () => {
        expect(msToMinutes(60000)).toBe(1);
    });

    it('converts 1500000 ms to 25 minutes', () => {
        expect(msToMinutes(1500000)).toBe(25);
    });

    it('floors partial minutes', () => {
        expect(msToMinutes(90000)).toBe(1); // 1.5 minutes floors to 1
    });
});

describe('generateId', () => {
    it('generates unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });

    it('generates IDs in expected format', () => {
        const id = generateId();
        expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });
});

describe('getTodayDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
        const date = getTodayDate();
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('getDateDaysAgo', () => {
    it('returns today for 0 days ago', () => {
        expect(getDateDaysAgo(0)).toBe(getTodayDate());
    });

    it('returns date in YYYY-MM-DD format', () => {
        const date = getDateDaysAgo(7);
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
