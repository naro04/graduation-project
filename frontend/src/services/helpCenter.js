/**
 * Help Center API Service
 * Connects to backend endpoints defined in swagger (Help section).
 * @see swagger.js: /help/content (GET)
 */

import { apiClient } from "./apiClient";

const HELP_BASE = "/help";

/**
 * Get help content (categories + popular articles)
 * GET /help/content
 * @returns {Promise<{ categories: Array, popular_articles?: Array }|Array>}
 */
export const getHelpContent = async () => {
  const response = await apiClient.get(`${HELP_BASE}/content`);
  const raw = response.data?.data ?? response.data;
  if (Array.isArray(raw)) return { categories: raw, popular_articles: [] };
  if (raw && typeof raw === "object") {
    return {
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      popular_articles: Array.isArray(raw.popular_articles) ? raw.popular_articles : [],
    };
  }
  return { categories: [], popular_articles: [] };
};
