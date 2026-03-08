const STORAGE_KEY = "mais-valias-sim";

export function useSimulationStorage() {
  function save(values: Record<string, unknown>) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // Silently ignore QuotaExceededError and other storage failures
      // (e.g. private browsing with storage full, or storage access denied)
    }
  }

  function load(): Record<string, unknown> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { save, load, clear };
}
