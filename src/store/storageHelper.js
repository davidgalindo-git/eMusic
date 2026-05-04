/**
 * Persistence utility for Pinia stores.
 * Distinguishes between permanent (localStorage) and session-based (sessionStorage) data.
 */

const STORAGE_KEY = 'emusic_data';

/**
 * Deterministically selects the storage API based on collection requirements.
 * @param {string} collectionName
 * @returns {Storage}
 */
const getStorageEngine = (collectionName) => {
    return collectionName === 'search_results' ? sessionStorage : localStorage;
};

/**
 * Safely retrieves and parses the aggregate store object.
 * @param {Storage} engine
 * @returns {Object}
 */
const getRawStore = (engine) => {
    try {
        const data = engine.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Storage corrupted, returning empty state.");
        return {};
    }
};

/**
 * Updates a specific collection within the aggregate store.
 * @param {string} collectionName - Target key.
 * @param {any} data - Serializable content.
 */
export const saveCollection = (collectionName, data) => {
    const engine = getStorageEngine(collectionName);
    const store = getRawStore(engine);

    store[collectionName] = data;
    engine.setItem(STORAGE_KEY, JSON.stringify(store));
};

/**
 * Loads a specific collection.
 * Returns an empty array instead of null to satisfy UI type expectations.
 */
export const loadCollection = (collectionName) => {
    const engine = getStorageEngine(collectionName);
    const store = getRawStore(engine);
    return store[collectionName] || []; // Return [] instead of null
};