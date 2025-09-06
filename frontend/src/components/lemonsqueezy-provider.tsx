
'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { config } from '@/lib/config';

declare global {
    interface Window {
        createLemonSqueezy: () => void;
        LemonSqueezy: {
            Setup: (config: { eventHandler: (event: any) => void }) => void;
            Refresh: () => void;
        };
    }
}

export function LemonSqueezyProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs when the component mounts and whenever the path changes.
    // It ensures that Lemon Squeezy re-initializes its buttons on client-side navigation.
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Refresh();
    }
  }, [pathname]);

  const handleOnLoad = () => {
    if (window.LemonSqueezy) {
       window.LemonSqueezy.Setup({
        eventHandler: (event) => {
          // You can handle checkout events here if needed
          // console.log('Lemon Squeezy Event:', event);
        },
      });
      window.createLemonSqueezy();
    }
  };

  return (
    <Script
      src={config.lemonSqueezyUrl}
      strategy="lazyOnload"
      onLoad={handleOnLoad}
    />
  );
}
