import type { Metadata } from "next"
import { QueryProvider } from "@/contexts/query-provider"

export const metadata: Metadata = {
  title: "Authentication - ShadcnStore",
  description: "Sign in to your account or create a new one",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <QueryProvider><div className="min-h-screen bg-background">{children}</div></QueryProvider>
}
