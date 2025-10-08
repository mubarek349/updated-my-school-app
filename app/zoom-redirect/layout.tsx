import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Joining Zoom Meeting...',
  description: 'Redirecting to Zoom meeting',
  robots: 'noindex, nofollow',
};

export default function ZoomRedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
