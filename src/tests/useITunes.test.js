import { describe, it, expect } from 'vitest';
import { useITunes } from '../api/useITunes';

describe('useITunes', () => {
    it('should load songs after research', async () => {
        const { songs, searchSongs } = useITunes();

        await searchSongs('Imagine Dragons');
        console.log(songs);
        expect(songs.value.length).toBeGreaterThan(0);
        expect(songs.value[0]).toHaveProperty('previewUrl'); // Must contain a previewUrl
    });
});