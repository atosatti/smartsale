'use client';

import { ReactNode } from 'react';

export function UserDropdownMenu({ 
  children, 
  trigger,
  ...props 
}: { 
  children?: ReactNode;
  trigger?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="user-dropdown-menu" {...props}>
      {trigger}
      {children}
    </div>
  );
}
