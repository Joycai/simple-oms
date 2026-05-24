import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n"
import { ApolloWrapper } from "@/components/ApolloWrapper"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "simple-oms",
  description: "Simple Order Management System",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950">
        <ApolloWrapper><I18nProvider>{children}</I18nProvider></ApolloWrapper>
      </body>
    </html>
  )
}
