import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'InDrive — Build a Fully-Booked Driving Instruction Business',
    template: '%s | InDrive',
  },
  description:
    'InDrive helps UK driving instructors fill their diary with motivated learners, automate admin, and get paid — free forever. Learners: find certified ADIs near you with real-time availability and transparent pricing.',
  keywords: [
    'driving instructor software UK',
    'ADI booking platform',
    'driving instructor app',
    'find driving instructor near me',
    'driving lessons near me',
    'ADI diary management',
    'driving school software',
    'book driving lessons online',
    'learn to drive',
    'driving instructor marketplace',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'InDrive',
  },
  twitter: {
    card: 'summary_large_image',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
