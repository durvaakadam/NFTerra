import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { WalletProvider } from '@/lib/context/WalletContext'
import { TxToastProvider } from '@/lib/context/TxToastContext'
import { NFTStoreProvider } from '@/lib/context/NFTStoreContext'
import { TxHistoryProvider } from '@/lib/context/TxHistoryContext'
import './globals.css'

const _jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NFTerra – Dynamic NFT Evolution Platform',
  description: 'Evolve your digital assets with NFTerra. Dynamic NFTs that level up and transform on the blockchain.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background">
        <WalletProvider>
          <TxToastProvider>
            <TxHistoryProvider>
              <NFTStoreProvider>
                {children}
                <Analytics />
              </NFTStoreProvider>
            </TxHistoryProvider>
          </TxToastProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
