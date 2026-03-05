import { forwardRef, ReactHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SheetProps extends ReactHTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  children?: ReactNode;
}

const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('sheet', className)} {...props}>
      {children}
    </div>
  ),
);

Sheet.displayName = 'Sheet';

const SheetContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('sheet-content fixed right-0 top-0 h-full w-full max-w-sm bg-background shadow-lg', className)}
      {...props}
    />
  ),
);

SheetContent.displayName = 'SheetContent';

const SheetBody = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('sheet-body p-4', className)} {...props} />
  ),
);

SheetBody.displayName = 'SheetBody';

const SheetHeader = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('sheet-header flex flex-col space-y-2 p-4', className)} {...props} />
  ),
);

SheetHeader.displayName = 'SheetHeader';

const SheetTrigger = forwardRef<HTMLButtonElement, ReactHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn('sheet-trigger', className)} {...props} />
  ),
);

SheetTrigger.displayName = 'SheetTrigger';

export { Sheet, SheetContent, SheetBody, SheetHeader, SheetTrigger };
