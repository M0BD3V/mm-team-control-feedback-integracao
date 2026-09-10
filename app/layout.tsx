import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MM Team Control | Feedback',
  referrer: 'no-referrer',
  description: 'Canal de feedback sobre treinamentos e soluções da MM Softwares.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'Feedback | MM Softwares',
    description: 'Sua experiência ajuda a gente a evoluir.',
    images: [{ url: '/og.png', width: 1792, height: 1024, alt: 'Canal de feedback MM Softwares' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Feedback | MM Softwares',
    description: 'Sua experiência ajuda a gente a evoluir.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className="antialiased">{children}</body></html>;
}
