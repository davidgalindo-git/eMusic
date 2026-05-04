/**
 * Utilitaire de persistance pour les stores Pinia.
 */

const STORAGE_KEY = 'emusic_data';

// Récupère l'objet global du projet
const getRawStore = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        // En cas de JSON invalide, retourner un objet vide
        console.error("LocalStorage corrompu, réinitialisation des données temporaires.");
        return {};
    }
};

/**
 * Sauvegarde une collection spécifique
 * @param {string} collectionName - Nom de la clé (ex: 'search_results' ou 'à la une')
 * @param {Array} data - Tableau de chansons mappées
 */
export const saveCollection = (collectionName, data) => {
    const store = getRawStore();
    store[collectionName] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

/**
 * Récupère une collection spécifique
 * @param {string} collectionName
 * @returns {Array}
 */
export const loadCollection = (collectionName) => {
    return getRawStore()[collectionName] || [];
};