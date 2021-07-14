const apiHost = 'https://api.livetl.app';

/* eslint-disable no-unused-vars */
/* eslint-disable quote-props */

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

/**
 * Creates a translation in the API
 * @param translation The translation to create. Object must contain the following properties: `videoId` `languageCode`, `translatedText`, `start`, and optionally `end`
 * @param authToken The authentication token for the user. User must be a registered translator
 * @returns {Promise<boolean|string>} True if the translation was created successfully, or the API error message
 */
export async function createTranslation(translation, authToken) {
  if (translation.videoId.length > 11) {
    return 'Video ID must be a valid YouTube Video ID (11 chars)';
  }

  if (translation.languageCode.length !== 2) { // TODO local lookup of language codes
    return 'Language Code must be a valid ISO 639-1 language code';
  }

  if (translation.translatedText.length === 0) {
    return 'Missing translation text';
  }

  if (translation.start < 0) {
    return 'Invalid start time';
  }

  if (translation.end !== null && translation.end !== undefined && translation.end >= translation.start) {
    return 'Invalid end time';
  }

  const response = await fetch(`${apiHost}/translations/${translation.videoId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(translation)
  });

  if (response.ok === false) {
    return await response.text();
  }

  return true;
}

/* Translators */

/**
 * Find a specific translator by their ID
 * @param userId The User ID too lookup
 * @returns {Promise<Object|string>} The translator object, or an error message from the API
 */
export async function getTranslator(userId) {
  if (userId.length === 0) {
    return 'Invalid user ID';
  }

  const response = await fetch(`${apiHost}/translators/${userId}`);
  if (response.ok === false) {
    return await response.text();
  }

  return await response.json();
}
