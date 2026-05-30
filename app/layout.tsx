import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TSINAXA CGI | Continuity Governance Infrastructure',
  description:
    'Executive continuity intelligence infrastructure for pressure visibility, trajectory monitoring, recovery governance, reliability assessment, and institutional survivability.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#050B14] font-sans text-slate-100">
        {children}
      </body>
    </html>
  )
}