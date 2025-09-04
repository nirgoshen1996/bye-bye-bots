import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { CSVProvider } from '@/contexts/csv-context'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { CookieBanner } from '@/components/ui/cookie-banner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bot Cleaner SaaS',
  description: 'Professional bot detection and cleaning service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AuthProvider>
              <CSVProvider>
                {children}
                <CookieBanner />
              </CSVProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
