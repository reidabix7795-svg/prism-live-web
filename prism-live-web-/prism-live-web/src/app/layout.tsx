import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prism — AI that meets you where you think',
  description: 'Prism by Reidabix Interactive. A focused, multi-personality AI workspace.',
  icons: { icon: '/prism-icon.png' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB"><body>{children}</body></html>;
}
