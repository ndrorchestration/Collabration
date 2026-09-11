import './globals.css';

export const metadata = {
  title: 'Intellectro — Governed Social Space',
  description: 'A governed social network where humans build communities with accountable AI infrastructure.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
