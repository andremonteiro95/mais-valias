import LZString from "lz-string";

export function useShareableLink() {
  function encode(values: Record<string, unknown>): string {
    return LZString.compressToEncodedURIComponent(JSON.stringify(values));
  }

  function decode(s: string): Record<string, unknown> | null {
    try {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(s));
    } catch {
      return null;
    }
  }

  function generateUrl(values: Record<string, unknown>): string {
    return `${window.location.origin}${window.location.pathname}?s=${encode(values)}`;
  }

  // Returns true on success, false if the Clipboard API is unavailable (non-HTTPS)
  // or if the user denied the clipboard-write permission. Toast feedback is handled by the caller.
  async function copyToClipboard(values: Record<string, unknown>): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(generateUrl(values));
      return true;
    } catch {
      return false;
    }
  }

  return { encode, decode, generateUrl, copyToClipboard };
}
