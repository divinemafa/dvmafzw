import './globals.css';
import '@/node_modules/react-modal-video/scss/modal-video.scss';
import Navbar from './components/Navbar/index';
import ConditionalFooter from './components/ConditionalFooter';


export const metadata = {
  title: 'BITCOIN MASCOT - The Official Bitcoin Mascot Token',
  description: 'A revolutionary Solana token designed to reinvigorate the market and bring Bitcoin spirit to everyone.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <ConditionalFooter />
      </body>
    </html>
  )
}
