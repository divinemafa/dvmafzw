/**
 * IPFS Utilities
 * 
 * Handles IPFS URL resolution and gateway fallbacks for hybrid HTTP/IPFS architecture.
 * Supports both current HTTP storage and future IPFS migration without code changes.
 */

// Public IPFS gateways (prioritized by reliability and speed)
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * Resolve an image URL to HTTP format
 * 
 * Supports:
 * - HTTP/HTTPS URLs (passthrough)
 * - IPFS protocol URLs (ipfs://Qm...)
 * - Raw IPFS hashes (Qm... or bafy...)
 * 
 * @param url - The image URL (HTTP, IPFS protocol, or raw hash)
 * @param gatewayIndex - Which IPFS gateway to use (for fallback)
 * @returns HTTP URL ready for use in <img> or Next.js <Image>
 */
export function resolveImageUrl(url: string | null | undefined, gatewayIndex: number = 0): string {
  // Handle null/undefined/empty
  if (!url || url.trim() === '') {
    return '/placeholder-image.jpg';
  }

  const trimmedUrl = url.trim();
  
  // If already HTTP/HTTPS, return as-is
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // If IPFS protocol, extract hash and convert to HTTP gateway
  if (trimmedUrl.startsWith('ipfs://')) {
    const hash = trimmedUrl.replace('ipfs://', '');
    const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
    return `${gateway}${hash}`;
  }
  
  // If raw IPFS hash (starts with Qm or bafy), convert to HTTP gateway
  if (trimmedUrl.startsWith('Qm') || trimmedUrl.startsWith('bafy')) {
    const gateway = IPFS_GATEWAYS[gatewayIndex] || IPFS_GATEWAYS[0];
    return `${gateway}${trimmedUrl}`;
  }
  
  // If none of the above, assume it's a relative path or malformed URL
  return trimmedUrl;
}

/**
 * Get the next IPFS gateway URL for fallback
 * 
 * When an IPFS image fails to load from one gateway, this function
 * returns the same hash but with the next gateway in the list.
 * 
 * @param currentUrl - The current failing URL
 * @returns Next gateway URL, or null if no more gateways available
 */
export function getNextGateway(currentUrl: string): string | null {
  // Find which gateway is currently being used
  const currentGatewayIndex = IPFS_GATEWAYS.findIndex(gateway => 
    currentUrl.includes(gateway)
  );
  
  // If not an IPFS gateway URL, or last gateway already tried, return null
  if (currentGatewayIndex === -1 || currentGatewayIndex >= IPFS_GATEWAYS.length - 1) {
    return null;
  }
  
  // Extract the hash from the current URL
  const hash = currentUrl.split('/ipfs/')[1];
  
  if (!hash) {
    return null;
  }
  
  // Return URL with next gateway
  const nextGateway = IPFS_GATEWAYS[currentGatewayIndex + 1];
  return `${nextGateway}${hash}`;
}

/**
 * Check if a URL is an IPFS URL (protocol or raw hash)
 * 
 * @param url - URL to check
 * @returns True if URL is IPFS-related
 */
export function isIPFSUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  const trimmedUrl = url.trim();
  
  return (
    trimmedUrl.startsWith('ipfs://') ||
    trimmedUrl.startsWith('Qm') ||
    trimmedUrl.startsWith('bafy')
  );
}

/**
 * Extract IPFS hash from any IPFS URL format
 * 
 * @param url - IPFS URL (protocol, gateway, or raw hash)
 * @returns The IPFS hash (CID) or null if not found
 */
export function extractIPFSHash(url: string | null | undefined): string | null {
  if (!url) return null;
  
  const trimmedUrl = url.trim();
  
  // IPFS protocol
  if (trimmedUrl.startsWith('ipfs://')) {
    return trimmedUrl.replace('ipfs://', '');
  }
  
  // Gateway URL
  if (trimmedUrl.includes('/ipfs/')) {
    const hash = trimmedUrl.split('/ipfs/')[1];
    // Remove any query params or paths after hash
    return hash?.split('?')[0].split('/')[0] || null;
  }
  
  // Raw hash
  if (trimmedUrl.startsWith('Qm') || trimmedUrl.startsWith('bafy')) {
    return trimmedUrl.split('?')[0].split('/')[0];
  }
  
  return null;
}

/**
 * Convert HTTP gateway URL back to IPFS protocol URL
 * 
 * Useful for storing canonical IPFS URLs in database
 * 
 * @param url - HTTP gateway URL
 * @returns IPFS protocol URL (ipfs://...) or original URL if not IPFS
 */
export function toIPFSProtocol(url: string | null | undefined): string {
  if (!url) return '';
  
  const hash = extractIPFSHash(url);
  
  if (!hash) {
    return url;
  }
  
  return `ipfs://${hash}`;
}

/**
 * Get all available gateway URLs for an IPFS hash
 * 
 * Useful for providing multiple sources in <picture> element
 * 
 * @param hash - IPFS hash (CID)
 * @returns Array of HTTP gateway URLs
 */
export function getAllGatewayUrls(hash: string): string[] {
  return IPFS_GATEWAYS.map(gateway => `${gateway}${hash}`);
}
