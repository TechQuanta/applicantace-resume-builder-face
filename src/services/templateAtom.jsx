// src/recoil/templateAtom.jsx
import { atom, selector } from 'recoil';

// Your API URL
const TEMPLATE_API_URL = "https://script.google.com/macros/s/AKfycbxrV1CTVynBFGnSJyCrnMQM1vLSIR7ksWRFxeYo-kECwN4221bGN4L42zzStPhhJrU/exec";

// --- Atoms for managing template data, loading, error, category selection, and login status ---

export const templatesState = atom({
    key: 'templatesState',
    default: [],
});

export const isPageLoadingState = atom({
    key: 'isPageLoadingState',
    default: false,
});

export const isMoreLoadingState = atom({
    key: 'isMoreLoadingState',
    default: false,
});

export const errorState = atom({
    key: 'errorState',
    default: null, // Stores any error object
});

export const selectedCategoryState = atom({
    key: 'selectedCategoryState',
    default: 'All', // Default category for template filtering
});

export const isAsmaeLoggedInState = atom({
    key: 'isAsmaeLoggedInState',
    default: false, // Default login status
});

// --- Selectors for derived data ---

// Selector to get unique categories from the fetched templates
export const categoriesSelector = selector({
    key: 'categoriesSelector',
    get: ({ get }) => {
        const templates = get(templatesState);
        const uniqueCategories = new Set(templates.map(template => template.category));
        // Add 'All' as a default category option
        return [
            { category: 'All', label: 'All Templates', icon: 'FaThLarge' },
            // Map your unique categories to objects with labels and icons if needed
            // For now, using category name as label, and a default icon or more logic here
            ...Array.from(uniqueCategories).map(cat => ({
                category: cat,
                label: cat, // You might want a more user-friendly label for each category
                icon: 'FaCube' // Default icon, you can extend this logic to match specific icons to categories
            }))
        ];
    },
});

// Selector to filter templates based on the selected category
export const filteredTemplatesSelector = selector({
    key: 'filteredTemplatesSelector',
    get: ({ get }) => {
        const templates = get(templatesState);
        const selectedCategory = get(selectedCategoryState);

        if (selectedCategory === 'All') {
            return templates;
        } else {
            return templates.filter(template => template.category === selectedCategory);
        }
    },
});

// --- Async Read-Only Selector to fetch raw template data ---
// This selector's 'get' function only makes the API call and returns the data.
// It does NOT set any other atoms directly. Its state (loading, error, value)
// will be observed by useRecoilValueLoadable.
export const templateDataQuery = selector({
    key: 'templateDataQuery',
    get: async () => {
        console.log("Fetching templates from API...");
        const response = await fetch(TEMPLATE_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const formattedData = data.map(item => ({
            id: item.drive_id,
            image: item.image_url,
            name: item.name,
            description: item.description,
            url: item.drive_id,
            category: item.category,
            // ⭐ CRITICAL ADDITION: Map the 'size' field from the API response
            size: item.size, // Assuming your API response has an 'item.size' field
        }));

        console.log("Templates fetched:", formattedData);
        return formattedData; // This is what the selector will resolve to
    },
});