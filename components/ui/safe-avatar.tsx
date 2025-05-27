'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClientOnly } from '@/components/client-only';

interface SafeAvatarProps {
  src?: string;
  alt?: string;
  fallbackText?: string;
  className?: string;
}

/**
 * A wrapper around the Avatar component that prevents hydration errors
 * by only rendering the fallback text on the client side
 */
export function SafeAvatar({ src, alt, fallbackText, className }: SafeAvatarProps) {
  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={alt || fallbackText || 'Avatar'} />}
      <AvatarFallback>
        <ClientOnly fallback="" delay={50}>
          {fallbackText ? fallbackText.substring(0, 2) : ''}
        </ClientOnly>
      </AvatarFallback>
    </Avatar>
  );
}
