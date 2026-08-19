const STORAGE_SEARCH_HISTORY = 'funshann_search_history';

export const INITIAL_SEARCH_HISTORY: string[] = [
  'Modern Architecture Barcelona',
  '@sophiachen',
  'Kyoto Pottery Ceramicists',
  '35mm analog film aesthetic',
  'Nordic Minimalism',
];

export const getSearchHistory = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_SEARCH_HISTORY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SEARCH_HISTORY;
};

export const saveSearchHistory = (history: string[]): void => {
  try {
    localStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error(e);
  }
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.setItem(STORAGE_SEARCH_HISTORY, JSON.stringify([]));
  } catch (e) {
    console.error(e);
  }
};

export const addSearchQuery = (query: string): string[] => {
  const trimmed = query.trim();
  if (!trimmed) return getSearchHistory();
  const current = getSearchHistory();
  const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...filtered].slice(0, 15);
  saveSearchHistory(updated);
  return updated;
};
