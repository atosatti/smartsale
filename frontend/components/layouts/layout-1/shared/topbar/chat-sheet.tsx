'use client';

import { ReactNode } from 'react';

export function ChatSheet({ 
  children, 
  trigger,
  ...props 
}: { 
  children?: ReactNode;
  trigger?: ReactNode;
  [key: string]: any;
}) {
  return (
    <div className="chat-sheet" {...props}>
      {trigger}
      {children}
    </div>
  );
}
