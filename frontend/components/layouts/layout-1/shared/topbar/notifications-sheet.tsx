'use client';

import { ReactNode } from 'react';

export function NotificationsSheet({ 
  children, 
  trigger,
  ...props 
}: { 
  children?: ReactNode;
  trigger?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="notifications-sheet" {...props}>
      {trigger}
      {children}
    </div>
  );
}
