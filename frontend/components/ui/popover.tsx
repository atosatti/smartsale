import { forwardRef, ReactHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Popover = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('popover', className)} {...props} />,
);

Popover.displayName = 'Popover';

const PopoverTrigger = forwardRef<HTMLButtonElement, ReactHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => <button ref={ref} className={cn('popover-trigger', className)} {...props} />,
);

PopoverTrigger.displayName = 'PopoverTrigger';

const PopoverContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md',
        className,
      )}
      {...props}
    />
  ),
);

PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
