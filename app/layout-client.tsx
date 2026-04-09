"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { CompanyProvider } from "@/contexts/company-context"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProvider>
      <CompanyProvider>
        {children}
        <ServiceWorkerRegistration />
      </CompanyProvider>
    </ThemeProvider>
  )
}
