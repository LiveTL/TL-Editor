const apiHost = 'https://api.livetl.app';

/* eslint-disable no-unused-vars */

/* Translations */

/**
 * Returns all translations in a language for a video, with optional filters
 * @param videoId The video to load translations for
 * @param langCode The ISO-639-1 language code to load translations for
 * @param since The minimum timestamp (in ms) for translations
 * @param requiredTranslators A list of translators IDs that that translations must be created by (cannot be used with excluded translators)
 * @param excludedTranslators A list of translators IDs that that translations must not be created by (cannot be used with required translators)
 * @returns {Promise<Object[]>|string} The loaded translations, or a data validation/api error message
 */
export async function loadTranslations(videoId, langCode, since = -1, requiredTranslators = [], excludedTranslators = []) {
  if (videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (langCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  if (requiredTranslators.length !== 0 && excludedTranslators.length !== 0) {
    return 'Required and Excluded Translators filters are mutually exclusive';
  }

  const required = requiredTranslators.join(',');
  const excluded = excludedTranslators.join(',');

  const response = await fetch(`${apiHost}/translations/${videoId}/${langCode}?since=${since}&require=${required}&exclude=${excluded}`);
  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}
