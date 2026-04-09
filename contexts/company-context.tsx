"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface CompanySettings {
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  industry?: string
  company_logo?: string
}

interface CompanyContextType {
  companySettings: CompanySettings | null
  updateCompanySettings: (settings: CompanySettings) => void
  loading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const fetchCompanySettings = async () => {
      try {
        // Try to get from localStorage first
        const stored = localStorage.getItem("company-settings")
        if (stored) {
          setCompanySettings(JSON.parse(stored))
        }

        // Then fetch from API
        const res = await fetch("/api/settings/company")
        if (res.ok) {
          const data = await res.json()
          setCompanySettings(data)
          localStorage.setItem("company-settings", JSON.stringify(data))
        }
      } catch (error) {
        console.error("Failed to fetch company settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanySettings()
  }, [])

  const updateCompanySettings = (settings: CompanySettings) => {
    setCompanySettings(settings)
    localStorage.setItem("company-settings", JSON.stringify(settings))
  }

  return (
    <CompanyContext.Provider value={{ companySettings, updateCompanySettings, loading }}>
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompanySettings() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompanySettings must be used within CompanyProvider")
  }
  return context
}
