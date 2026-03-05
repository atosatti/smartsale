import { forwardRef, ReactHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Separator = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-border', className)} {...props} />
  ),
);

Separator.displayName = 'Separator';

export { Separator };
