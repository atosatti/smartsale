'use client';

import MetronicLayout from '@/components/MetronicLayout';
import { DocumentationViewer } from "@/components/documentation/DocumentationViewer";

export default function HelpPage() {
  return (
    <MetronicLayout>
      <DocumentationViewer />
    </MetronicLayout>
  );
}
