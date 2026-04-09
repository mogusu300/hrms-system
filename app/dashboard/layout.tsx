"use client"

import type React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { PWAInstallButton } from "@/components/pwa-install-button"
import { Menu, X } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AppSidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* PWA Install Banner - shown on mobile */}
        <div className="lg:hidden">
          <PWAInstallButton variant="banner" />
        </div>

        {/* Top navbar with mobile menu toggle */}
        <header className="h-16 border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="h-full px-4 lg:px-6 flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-accent/10 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {/* Render TopNavbar content inline */}
            <div className="flex-1">
              <TopNavbar />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-secondary/30">{children}</main>
      </div>
    </div>
  )
}
