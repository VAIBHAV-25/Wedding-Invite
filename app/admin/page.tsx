import type { Metadata } from 'next';
import { Studio } from '@/components/admin/Studio';
import './admin.css';

export const metadata: Metadata = {
  title: 'Content Studio',
  // The couple's working area has no business in search results.
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <Studio />;
}
