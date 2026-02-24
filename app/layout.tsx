import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gestion des Étudiants',
  description: 'Application de gestion des étudiants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
