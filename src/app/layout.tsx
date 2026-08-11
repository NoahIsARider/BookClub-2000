import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookClub 2000 - Co-reading Club & Reading Log',
  description: 'A Windows 2000-styled asynchronous co-reading platform — read the same book together, annotate and discuss. Also hosts a personal reading log.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
