'use client';

import { ReactNode } from 'react';

export function AppsDropdownMenu({ 
  children, 
  trigger,
  ...props 
}: { 
  children?: ReactNode;
  trigger?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="apps-dropdown-menu" {...props}>
      {trigger}
      {children}
    </div>
  );
}
