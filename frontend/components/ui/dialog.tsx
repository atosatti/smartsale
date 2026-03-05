import { forwardRef, ReactHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Dialog = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('dialog', className)} {...props} />,
);

Dialog.displayName = 'Dialog';

const DialogContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
        className,
      )}
      {...props}
    />
  ),
);

DialogContent.displayName = 'DialogContent';

const DialogTitle = forwardRef<HTMLHeadingElement, ReactHTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  ),
);

DialogTitle.displayName = 'DialogTitle';

export { Dialog, DialogContent, DialogTitle };
