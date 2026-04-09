"use client"

import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  Activity,
  CheckSquare,
  FileText,
  Settings,
  Building2,
  ChevronRight,
  ShoppingCart,
  Package,
  Undo2,
  Wallet,
  Receipt,
  Plane,
  Landmark,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { PWAInstallButton } from "@/components/pwa-install-button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

const requestLinks = [
  { name: "Leave", href: "/dashboard/requests/leave", icon: Calendar },
  { name: "Salary Advance", href: "/dashboard/requests/salary-advance", icon: Briefcase },
  { name: "Cash Advance", href: "/dashboard/requests/cash-advance", icon: Wallet },
  { name: "Cash Claim", href: "/dashboard/requests/cash-claim", icon: Receipt },
  { name: "Imprest", href: "/dashboard/requests/imprest", icon: Plane },
  { name: "Loan", href: "/dashboard/requests/loan", icon: Landmark },
  { name: "Performance", href: "/dashboard/requests/performance", icon: Target },
  { name: "Purchase Requisition", href: "/dashboard/requests/purchase-requisition", icon: ShoppingCart },
  { name: "Stores Requisition", href: "/dashboard/requests/stores-requisition", icon: Package },
  { name: "Stores Return", href: "/dashboard/requests/stores-return", icon: Undo2 },
]

const mainNavigation = [
  { name: "Payslip", href: "/dashboard/payslip", icon: FileText },
  { name: "Approval", href: "/dashboard/approval", icon: CheckSquare },
  { name: "Tracking", href: "/dashboard/tracking", icon: Activity },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const trackingLinks = [
  { name: "Stores Tracking", href: "/dashboard/reports/stores-tracking", icon: FileText },
  { name: "Purchase Tracking", href: "/dashboard/reports/purchase-tracking", icon: FileText },
  { name: "Staff Advances Tracking", href: "/dashboard/reports/staff-advances-tracking", icon: FileText },
  { name: "Transport Requests Tracking", href: "/dashboard/reports/transport-requests-tracking", icon: FileText },
  { name: "Salary Advance Tracking", href: "/dashboard/reports/salary-advance-tracking", icon: FileText },
  { name: "Cash Advance Tracking", href: "/dashboard/reports/cash-advance-tracking", icon: FileText },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [employeeData, setEmployeeData] = useState<{ name: string; department: string } | null>(null)
  const [employeeNumber, setEmployeeNumber] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("HRMS")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Get session first
        const sessionRes = await fetch("/api/session")
        if (!sessionRes.ok) return

        const session = await sessionRes.json()
        // Django line 431: Session uses 'employee_number' key
        setEmployeeNumber(session.session?.employee_number)

        // Then fetch employee details
        if (session.session?.employee_number) {
          const detailsRes = await fetch(
            `/api/employee-details?manNumber=${encodeURIComponent(session.session.employee_number)}`
          )
          if (detailsRes.ok) {
            const details = await detailsRes.json()
            setEmployeeData({
              name: details.Full_Name || details.name || "Employee",
              department: details.Department || details.department || "N/A",
            })
          }

          // Check for profile picture
          const profilePic = localStorage.getItem(`profile-pic-${session.session?.employee_number}`)
          if (profilePic) {
            setProfileImage(profilePic)
          }
        }

        // Load company settings
        const storedLogo = localStorage.getItem("company-logo")
        const storedSettings = localStorage.getItem("company-settings")
        
        if (storedLogo) {
          setCompanyLogo(storedLogo)
        }
        
        if (storedSettings) {
          try {
            const settings = JSON.parse(storedSettings)
            setCompanyName(settings.company_name || "HRMS")
          } catch (error) {
            console.error("Failed to parse company settings:", error)
          }
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployeeData()
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <Building2 className="w-6 h-6 text-sidebar-primary-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground line-clamp-1">{companyName}</h1>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}

        {/* Requests Section - Under Dashboard */}
        <div className="pt-2 mt-2">
          <h3 className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Requests
          </h3>
          {requestLinks.length === 0 ? (
            <p className="px-4 py-2 text-xs text-sidebar-foreground/40">No requests yet</p>
          ) : (
            requestLinks.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ml-2 mr-2 font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              )
            })
          )}
        </div>

        {/* Main Navigation */}
        {mainNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* PWA Install Button */}
      <div className="px-4 pb-1">
        <PWAInstallButton variant="sidebar" />
      </div>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => router.push("/dashboard/settings?tab=profile")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-semibold flex-shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              employeeData ? getInitials(employeeData.name) : "JD"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {employeeData?.name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {employeeData?.department || "Employee"}
            </p>
          </div>
        </button>
      </div>
    </aside>
  )
}
