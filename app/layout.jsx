import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Skuter.az | Bütün skuterlər tək platformada',
  description: 'Bolt, Jet, və Lime skuterlərini tapın və qiymətləri müqayisə edin. Ən yaxşı marşrutu AI ilə kəşf edin.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
