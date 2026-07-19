import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookClub 2000 - 共读俱乐部',
  description: '异步共读协作平台 - 一群人读同一本书，一起标注和讨论',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
