/**
 * (by Claude AI)
 * songMapper.js
 * Normalizes and sorts raw iTunes API song data.
 */

/**
 * Maps a raw iTunes API track object to a clean song model.
 * @param {Object} raw - Raw track object from iTunes API
 * @returns {Object} Normalized song object
 */
export function mapSong(raw) {
    return {
        trackId:        raw.trackId,
        trackName:      raw.trackName       ?? "Unknown Track",
        artistName:     raw.artistName      ?? "Unknown Artist",
        albumName:      raw.collectionName  ?? "Unknown Album",
        genre:          raw.primaryGenreName ?? "Unknown Genre",
        releaseYear:    raw.releaseDate
            ? new Date(raw.releaseDate).getUTCFullYear()
            : null,
        releaseDate:    raw.releaseDate     ?? null,
        durationMs:     raw.trackTimeMillis ?? 0,
        previewUrl:     raw.previewUrl      ?? null,
        artworkUrl:     raw.artworkUrl100
            ? raw.artworkUrl100.replace("100x100", "300x300")
            : null,
        trackPrice:     raw.trackPrice      ?? null,
        currency:       raw.currency        ?? null,
        country:        raw.country         ?? null,
        explicit:       raw.trackExplicitness === "explicit",
        trackNumber:    raw.trackNumber     ?? null,
        trackCount:     raw.trackCount      ?? null,
    };
}

/**
 * Sort keys and their labels for UI use.
 */
export const SORT_OPTIONS = [
    { key: "trackName",   label: "Title (A–Z)" },
    { key: "artistName",  label: "Artist (A–Z)" },
    { key: "albumName",   label: "Album (A–Z)" },
    { key: "releaseDate", label: "Release Date (Newest)" },
    { key: "durationMs",  label: "Duration" },
    { key: "trackNumber", label: "Track Number" },
];

/**
 * Sorts an array of mapped songs by the given key.
 * @param {Object[]} songs   - Array of mapped song objects
 * @param {string}   sortKey - Key to sort by (see SORT_OPTIONS)
 * @param {"asc"|"desc"} [order="asc"] - Sort direction
 * @returns {Object[]} New sorted array (original is not mutated)
 */
export function sortSongs(songs, sortKey = "trackName", order = "asc") {
    const isDesc = order === "desc";

    return [...songs].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        // Null / undefined values always sink to the bottom
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let result = 0;
        if (typeof aVal === "string" && typeof bVal === "string") {
            result = aVal.localeCompare(bVal, undefined, { sensitivity: "base" });
        } else {
            result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }

        return isDesc ? -result : result;
    });
}

/**
 * Convenience: map an array of raw iTunes results and immediately sort them.
 * Call this right after receiving the API response.
 *
 * @param {Object[]} rawResults - `results` array from iTunes API response
 * @param {string}   [sortKey]  - Sort key (default: "trackName")
 * @param {"asc"|"desc"} [order] - Sort direction (default: "asc")
 * @returns {Object[]} Mapped and sorted songs
 *
 * @example
 * const response = await fetch("https://itunes.apple.com/search?term=...");
 * const { results } = await response.json();
 * const songs = mapAndSortSongs(results, "artistName");
 */
export function mapAndSortSongs(rawResults, sortKey = "trackName", order = "asc") {
    const mapped = rawResults
        .filter((r) => r.wrapperType === "track" && r.kind === "song")
        .map(mapSong);

    return sortSongs(mapped, sortKey, order);
}