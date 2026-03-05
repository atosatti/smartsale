import { forwardRef, ReactHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Select = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('select', className)} {...props} />,
);

Select.displayName = 'Select';

const SelectTrigger = forwardRef<HTMLButtonElement, ReactHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = forwardRef<HTMLSpanElement, ReactHTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('text-muted-foreground', className)} {...props} />
  ),
);

SelectValue.displayName = 'SelectValue';

const SelectContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative z-50 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        className,
      )}
      {...props}
    />
  ),
);

SelectContent.displayName = 'SelectContent';

const SelectItem = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent focus:text-accent-foreground',
        className,
      )}
      {...props}
    />
  ),
);

SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
