import './globals.css';
import './product-shell.css';

export const metadata = {
  title: 'Collabration — Governed Human+AI Social Space',
  description: 'A governed human+AI social network where communities collaborate with accountable AI infrastructure.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
