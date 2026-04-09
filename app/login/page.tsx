"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Lock, User } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const [employee_number, setEmployeeNumber] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState("HRMS")

  useEffect(() => {
    setMounted(true)
    // Load company settings from localStorage
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
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_number,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        toast({
          title: "Login Failed",
          description: data.error || 'Invalid credentials',
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Login successful
      toast({
        title: "Success",
        description: `Welcome back, ${data.user.name}!`,
        variant: "default",
      })

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/diverse-team-of-professionals-collaborating-in-mod.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm" />
      </div>

      {/* Glassmorphic login card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30 dark:border-white/20">
              {companyLogo ? (
                <img src={companyLogo} alt="Company Logo" className="w-16 h-16 object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-balance">Welcome Back</h1>
              <p className="text-white/80 dark:text-white/70 mt-2 text-balance">
                Sign in to access your {companyName} dashboard
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="employee_number" className="text-white font-medium">
                Employee Number
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  id="employee_number"
                  type="text"
                  placeholder="WEBUSER"
                  value={employee_number}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  className="pl-12 h-12 bg-white/10 dark:bg-white/5 border-white/30 dark:border-white/20 text-white placeholder:text-white/50 backdrop-blur-md focus:bg-white/20 dark:focus:bg-white/10 focus:border-white/50 dark:focus:border-white/30 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-white/90 hover:text-white transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-white/10 dark:bg-white/5 border-white/30 dark:border-white/20 text-white placeholder:text-white/50 backdrop-blur-md focus:bg-white/20 dark:focus:bg-white/10 focus:border-white/50 dark:focus:border-white/30 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white dark:bg-white/90 text-primary hover:bg-white/90 dark:hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register link */}
          <p className="text-center text-white/90 dark:text-white/80">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-white hover:text-white/80 font-semibold transition-colors underline underline-offset-2"
            >
              Register here
            </Link>
          </p>

          {/* Privacy Policy link */}
          <p className="text-center text-white/60 text-xs">
            By using this app you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="text-white/80 hover:text-white transition-colors underline underline-offset-2"
            >
              Privacy & Data Protection Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
