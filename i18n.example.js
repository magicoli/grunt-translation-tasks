/**
 * JavaScript localization utility
 * 
 * This file provides the localization functionality for JavaScript files
 * to be compatible with delight-im/i18n integration.
 */

// Create a global namespace for localization if it doesn't exist
window.Talents = window.Talents || {};

/**
 * Translation function that mimics delight-im/i18n _() function
 * @param {string} text - The text to be translated
 * @param {object} params - Parameters to replace in the translated string
 * @returns {string} - The translated string
 */
window.Talents._ = function(text, params = {}) {
    // Get translation from window.translations object if available
    // i18next-conv creates a nested structure with the locale code
    let translated = text;
    
    if (window.translations) {
        // Handle i18next-conv format (has translation property)
        const translations = window.translations.translation ?? window.translations;
        translated = translations[text] || text;
    }
    
    // Handle parameter replacement (similar to delight-im/i18n)
    if (Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => {
            translated = translated.replace(new RegExp('\\{\\$' + key + '\\}', 'g'), params[key]);
        });
    }
    
    return translated;
};

/**
 * Shorthand function for the translation function
 * Makes it available globally as _() similar to PHP
 */
window._ = window.Talents._;

/**
 * Translation function with number-sensitive context (for pluralization)
 * @param {string} singular - The singular form of the text
 * @param {string} plural - The plural form of the text
 * @param {number} count - The count that determines which form to use
 * @param {object} params - Parameters to replace in the translated string
 * @returns {string} - The translated string
 */
window.Talents._p = function(singular, plural, count, params = {}) {
    // Get translation from window.translations object if available
    const key = count === 1 ? singular : plural;
    
    // Handle translations with i18next-conv format
    let translated = key;
    
    if (window.translations) {
        // Handle i18next-conv format (has translation property)
        const translations = window.translations.translation ?? window.translations;
        translated = translations[key] || key;
    }
    
    // Add count to params if not already included
    params.count = params.count || count;
    
    // Handle parameter replacement
    if (Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => {
            translated = translated.replace(new RegExp('\\{\\$' + key + '\\}', 'g'), params[key]);
        });
    }
    
    return translated;
};

/**
 * Translation with context, mimics the _c() function in PHP
 * @param {string} text - The text to translate
 * @param {string} context - The context for the translation
 * @param {object} params - Parameters to replace in the translated string
 * @returns {string} - The translated string
 */
window.Talents._c = function(text, context, params = {}) {
    // In gettext, context is typically stored as context\u0004text
    const contextKey = context + '\u0004' + text;
    
    // Try to get the translation with context first
    let translated = text;
    
    if (window.translations) {
        // Handle i18next-conv format (has translation property)
        const translations = window.translations.translation ?? window.translations;
        translated = translations[contextKey] || translations[text] || text;
    }
    
    // Handle parameter replacement
    if (Object.keys(params).length > 0) {
        Object.keys(params).forEach(key => {
            translated = translated.replace(new RegExp('\\{\\$' + key + '\\}', 'g'), params[key]);
        });
    }
    
    return translated;
};

/**
 * Format a translated string with parameters
 * @param {string} text - The text to translate
 * @param {...any} args - Arguments to replace placeholders with
 * @returns {string} - The formatted translated string
 */
window.Talents._f = function(text, ...args) {
    const translated = window.Talents._(text);
    
    // Replace %s, %d, etc. with arguments
    return translated.replace(/%([sdfo])/g, function(match, type) {
        if (args.length === 0) return match;
        
        const arg = args.shift();
        switch (type) {
            case 's': return String(arg);
            case 'd': return parseInt(arg, 10);
            case 'f': return parseFloat(arg);
            case 'o': return Object(arg);
            default: return arg;
        }
    });
};

/**
 * Mark a string for translation without translating it
 * @param {string} text - The text to mark for translation
 * @returns {string} - The original text
 */
window.Talents._m = function(text) {
    return text;
};

/**
 * Format a translated plural string with parameters
 * @param {string} singular - The singular form of the text
 * @param {string} plural - The plural form of the text
 * @param {number} count - The count that determines which form to use
 * @param {...any} args - Arguments to replace placeholders with
 * @returns {string} - The formatted translated string
 */
window.Talents._pf = function(singular, plural, count, ...args) {
    const translated = window.Talents._p(singular, plural, count);
    
    // Replace %s, %d, etc. with arguments
    return translated.replace(/%([sdfo])/g, function(match, type) {
        if (args.length === 0) return match;
        
        const arg = args.shift();
        switch (type) {
            case 's': return String(arg);
            case 'd': return parseInt(arg, 10);
            case 'f': return parseFloat(arg);
            case 'o': return Object(arg);
            default: return arg;
        }
    });
};

// Make all translation functions globally available
window._p = window.Talents._p;
window._c = window.Talents._c;
window._f = window.Talents._f;
window._m = window.Talents._m;
window._pf = window.Talents._pf;
