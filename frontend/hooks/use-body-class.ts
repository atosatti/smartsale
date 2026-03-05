'use client';

import { useEffect } from 'react';

export function useBodyClass(className: string): void {
  useEffect(() => {
    document.body.classList.add(className);
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
}
