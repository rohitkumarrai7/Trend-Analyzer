import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TrendMap - Real-time Social Trends',
  description: 'Visualize global social media trends on an interactive heatmap.',
  icons: { icon: '/favicon.ico' },
};

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const head = (
    <head>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    </head>
  );

  // Without a valid Clerk key (e.g. during static prerendering of /_not-found on CI),
  // skip auth providers so Next.js can finish the build without throwing.
  if (!CLERK_KEY) {
    return (
      <html lang="en" className="dark">
        {head}
        <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-primary/30`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <html lang="en" className="dark">
        {head}
        <body className={`${inter.className} min-h-screen bg-background antialiased selection:bg-primary/30`}>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
