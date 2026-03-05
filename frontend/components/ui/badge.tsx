import { forwardRef, ReactHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Badge = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground',
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = 'Badge';

export { Badge };
