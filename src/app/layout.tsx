import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { SidebarConfigProvider } from "@/contexts/sidebar-context"
import { Toaster } from "@/components/ui/toast"
import { inter } from "@/lib/fonts"
import { QueryProvider } from "@/contexts/query-provider"

export const metadata: Metadata = {
  title: "Shadcn Dashboard",
  description: "A dashboard built with Next.js and shadcn/ui",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, "antialiased")}>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>
            <QueryProvider>
              <Toaster>{children}</Toaster>
            </QueryProvider>
          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
