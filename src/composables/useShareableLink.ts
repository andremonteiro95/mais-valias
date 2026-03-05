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

  async function copyToClipboard(values: Record<string, unknown>): Promise<void> {
    await navigator.clipboard.writeText(generateUrl(values));
  }

  return { encode, decode, generateUrl, copyToClipboard };
}
