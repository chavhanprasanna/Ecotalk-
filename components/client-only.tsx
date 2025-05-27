'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Optional delay in ms before rendering client content
   * This can help ensure DOM is fully hydrated before rendering
   */
  delay?: number;
}

/**
 * Component that only renders its children on the client side
 * This helps prevent hydration errors when server and client rendering differ
 */
export function ClientOnly({ children, fallback = null, delay = 0 }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Use a timeout to ensure the component is fully mounted
    // This helps prevent hydration errors in complex components
    const timer = setTimeout(() => {
      setIsClient(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return isClient ? <>{children}</> : <>{fallback}</>;
}

/**
 * Higher-order component that wraps a component to only render on client side
 * @param Component The component to wrap
 * @param fallback Optional fallback to show during server rendering
 */
export function withClientOnly<P extends object>(Component: React.ComponentType<P>, fallback: ReactNode = null) {
  return function WithClientOnly(props: P) {
    return (
      <ClientOnly fallback={fallback}>
        <Component {...props} />
      </ClientOnly>
    );
  };
}
