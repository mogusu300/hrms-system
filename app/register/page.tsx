"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, User, Phone } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [employee_number, setEmployeeNumber] = useState("")
  const [phone_number, setPhoneNumber] = useState("260")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    // Ensure it always starts with 260
    if (!value.startsWith("260")) {
      value = "260" + value.replace(/^260/, "")
    }
    // Max length 12 (260 + 9 digits)
    setPhoneNumber(value.slice(0, 12))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate inputs
    if (!employee_number.trim()) {
      setError("Employee number is required")
      return
    }
    if (!phone_number || phone_number.length < 12) {
      setError("Phone number must be 12 digits")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register/check-employee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_number,
          phone_number,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'An error occurred'
        setError(errorMessage)
        toast({
          title: "Check Failed",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Store data in sessionStorage for next steps
      sessionStorage.setItem('employee_number', employee_number)
      sessionStorage.setItem('phone_number', phone_number)
      sessionStorage.setItem('otp_result', data.otp_result || '')

      toast({
        title: "Success",
        description: "Proceeding to account creation",
        variant: "default",
      })

      // Redirect directly to create account (skipping OTP for now)
      router.push('/register/create-account')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
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

      {/* Glassmorphic card */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30 dark:border-white/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white text-balance">Register Account</h1>
              <p className="text-white/80 dark:text-white/70 mt-2 text-balance">
                Step 1: Verify Your Identity
              </p>
            </div>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="employee_number" className="text-white font-medium text-sm block">
                Employee Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="employee_number"
                  type="text"
                  placeholder="e.g., M1234"
                  value={employee_number}
                  onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())}
                  maxLength={5}
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone_number" className="text-white font-medium text-sm block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="260700123456"
                  value={phone_number}
                  onChange={handlePhoneChange}
                  maxLength={12}
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:bg-white/15 rounded-xl"
                  required
                />
              </div>
              <p className="text-xs text-white/60 mt-1">We'll send an OTP to +{phone_number}</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white text-slate-900 hover:bg-white/90 font-semibold rounded-xl py-2 mt-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Continue"}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-white/90 dark:text-white/80">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:text-white/80 font-semibold transition-colors underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
