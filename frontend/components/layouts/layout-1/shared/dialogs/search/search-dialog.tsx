'use client';

import { ReactNode } from 'react';

export function SearchDialog({ 
  children, 
  trigger,
  ...props 
}: { 
  children?: ReactNode;
  trigger?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="search-dialog" {...props}>
      {trigger}
      {children}
    </div>
  );
}
