import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from '@/shared/components/layout/Providers'

export const metadata: Metadata = {
  title: 'APL Calculadora de Estimación',
  description: 'Herramienta corporativa INDRA para estimar esfuerzo de desarrollo de software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
