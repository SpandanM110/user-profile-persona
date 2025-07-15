import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'reddit-url-persona',
  description: 'Created by Spandan Mukherjee',

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
