'use client';

import Image from 'next/image';
import { useState } from 'react';
import { resolveImageUrl, getNextGateway } from '@/lib/utils/ipfs';

interface IPFSImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

/**
 * IPFSImage Component
 * 
 * Next.js Image wrapper with IPFS support and automatic gateway fallbacks.
 * 
 * Features:
 * - Supports HTTP/HTTPS URLs (passthrough)
 * - Supports IPFS protocol URLs (ipfs://Qm...)
 * - Supports raw IPFS hashes (Qm... or bafy...)
 * - Automatic fallback to next gateway on error
 * - Shows placeholder if all gateways fail
 * 
 * Usage:
 * <IPFSImage src="ipfs://Qm..." alt="..." fill />
 * <IPFSImage src="https://..." alt="..." width={200} height={200} />
 */
export function IPFSImage({ 
  src, 
  alt, 
  width, 
  height, 
  fill, 
  className = '',
  sizes,
  priority = false,
  quality = 75,
}: IPFSImageProps) {
  // Resolve initial image URL (IPFS → HTTP gateway)
  const [imageUrl, setImageUrl] = useState(resolveImageUrl(src));
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    // Try next IPFS gateway
    const nextUrl = getNextGateway(imageUrl);
    
    if (nextUrl && retryCount < 3) {
      // Try next gateway
      setImageUrl(nextUrl);
      setRetryCount(prev => prev + 1);
    } else {
      // All gateways failed or not an IPFS URL
      setHasError(true);
    }
  };

  // Show fallback if all attempts failed
  if (hasError || imageUrl === '/placeholder-image.jpg') {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10 ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <div className="text-center p-4">
          <svg
            className="mx-auto h-12 w-12 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-xs text-white/40">Image unavailable</p>
        </div>
      </div>
    );
  }

  // Render Next.js Image with resolved URL
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      quality={quality}
      onError={handleError}
      unoptimized={imageUrl.includes('ipfs')} // Disable optimization for IPFS URLs
    />
  );
}
