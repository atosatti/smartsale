'use client';

import { forwardRef, ReactHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface AccordionMenuClassNames {
  root?: string;
  group?: string;
  label?: string;
  button?: string;
  content?: string;
  sub?: string;
  subTrigger?: string;
  subContent?: string;
  item?: string;
  [key: string]: string | undefined;
}

const AccordionMenu = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu', className)} {...props} />
  ),
);

AccordionMenu.displayName = 'AccordionMenu';

const AccordionMenuButton = forwardRef<HTMLButtonElement, ReactHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn('accordion-menu-button', className)} {...props} />
  ),
);

AccordionMenuButton.displayName = 'AccordionMenuButton';

const AccordionMenuContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu-content', className)} {...props} />
  ),
);

AccordionMenuContent.displayName = 'AccordionMenuContent';

const AccordionMenuSub = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu-sub', className)} {...props} />
  ),
);

AccordionMenuSub.displayName = 'AccordionMenuSub';

const AccordionMenuSubTrigger = forwardRef<HTMLButtonElement, ReactHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn('accordion-menu-sub-trigger', className)} {...props} />
  ),
);

AccordionMenuSubTrigger.displayName = 'AccordionMenuSubTrigger';

const AccordionMenuSubContent = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu-sub-content', className)} {...props} />
  ),
);

AccordionMenuSubContent.displayName = 'AccordionMenuSubContent';

const AccordionMenuGroup = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu-group', className)} {...props} />
  ),
);

AccordionMenuGroup.displayName = 'AccordionMenuGroup';

const AccordionMenuItem = forwardRef<HTMLDivElement, ReactHTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('accordion-menu-item', className)} {...props} />
  ),
);

AccordionMenuItem.displayName = 'AccordionMenuItem';

const AccordionMenuLabel = forwardRef<HTMLLabelElement, ReactHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn('accordion-menu-label', className)} {...props} />
  ),
);

AccordionMenuLabel.displayName = 'AccordionMenuLabel';

const AccordionMenuClassNamesObj: AccordionMenuClassNames = {
  button: 'accordion-menu-button',
  content: 'accordion-menu-content',
};

export {
  AccordionMenu,
  AccordionMenuButton,
  AccordionMenuContent,
  AccordionMenuSub,
  AccordionMenuSubTrigger,
  AccordionMenuSubContent,
  AccordionMenuGroup,
  AccordionMenuItem,
  AccordionMenuLabel,
  AccordionMenuClassNamesObj as AccordionMenuClassNames,
};
