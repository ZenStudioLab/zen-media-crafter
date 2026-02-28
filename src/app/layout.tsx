import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { ApiKeyConfig } from './components/api-key-config';

export const metadata: Metadata = {
  title: 'Zen Media Crafter',
  description: 'AI Generated Media Layouts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ApiKeyConfig />
          {children}
        </Providers>
      </body>
    </html>
  );
}
