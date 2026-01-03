/**
 * Simple client-side internationalization module
 * Loads translations from JSON files and updates DOM elements with data-i18n attribute
 */
const i18n = (function() {
    const STORAGE_KEY = 'supacoda-lang';
    const DEFAULT_LANG = 'en';
    const SUPPORTED_LANGS = ['en', 'de'];
    
    let currentLang = DEFAULT_LANG;
    let translations = {};

    /**
     * Get saved language preference or detect from browser
     */
    function getInitialLang() {
        // Check localStorage first
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGS.includes(saved)) {
            return saved;
        }
        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGS.includes(browserLang)) {
            return browserLang;
        }
        return DEFAULT_LANG;
    }

    /**
     * Load translations for a given language
     */
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            return await response.json();
        } catch (error) {
            console.error('Error loading translations:', error);
            return {};
        }
    }

    /**
     * Update all elements with data-i18n attribute
     */
    function updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });
        // Update html lang attribute
        document.documentElement.lang = currentLang;
    }

    /**
     * Initialize i18n system
     */
    async function init() {
        currentLang = getInitialLang();
        translations = await loadTranslations(currentLang);
        updateDOM();
        
        // Set up language toggle button
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', toggleLanguage);
        }
    }

    /**
     * Toggle between languages
     */
    async function toggleLanguage() {
        currentLang = currentLang === 'en' ? 'de' : 'en';
        localStorage.setItem(STORAGE_KEY, currentLang);
        translations = await loadTranslations(currentLang);
        updateDOM();
    }

    /**
     * Get current language
     */
    function getLang() {
        return currentLang;
    }

    /**
     * Get a specific translation
     */
    function t(key) {
        return translations[key] || key;
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        toggleLanguage,
        getLang,
        t
    };
})();
