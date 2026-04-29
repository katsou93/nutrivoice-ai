import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'NutriVoice AI',
  description: 'KI-basierter Kalorienzähler per Stimme',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="dark">
      <body className="bg-zinc-950 text-zinc-100 font-body antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
