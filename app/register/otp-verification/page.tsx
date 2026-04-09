'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building2, Lock, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * DEPRECATED: OTP Verification Page
 * 
 * This page is currently unused in the registration flow.
 * The registration process routes directly from /register (check-employee)
 * to /register/create-account, bypassing this OTP verification step.
 * 
 * Reference: /app/register/page.tsx line 88
 * Status: Dead code - kept for reference/future use only
 */

export default function OTPVerificationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpSent, setOtpSent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Get data from sessionStorage
    const emp = sessionStorage.getItem('employee_number') || ''
    const phone = sessionStorage.getItem('phone_number') || ''
    const otpCode = sessionStorage.getItem('otp_result') || ''
    
    setEmployeeNumber(emp)
    setPhoneNumber(phone)
    setOtpSent(otpCode)
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!otp.trim()) {
        setError('Please enter the OTP')
        setIsLoading(false)
        return
      }

      if (!/^\d{4}$/.test(otp)) {
        setError('OTP must be 4 digits')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_number: employeeNumber,
          otp,
          otp_sent: otpSent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid OTP')
        toast({
          title: 'Verification Failed',
          description: data.error || 'Invalid OTP',
          variant: 'destructive',
        })
        setIsLoading(false)
        return
      }

      toast({
        title: 'Success',
        description: 'OTP verified successfully',
        variant: 'default',
      })

      // Update sessionStorage to mark OTP as verified
      const registrationData = sessionStorage.getItem('registrationData')
      if (registrationData) {
        const data = JSON.parse(registrationData)
        sessionStorage.setItem('registrationData', JSON.stringify({
          ...data,
          otpVerified: true,
        }))
      }

      // Redirect to create account page
      setTimeout(() => {
        router.push('/register/create-account')
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/register')
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
              <h1 className="text-3xl font-bold text-white text-balance">Verify OTP</h1>
              <p className="text-white/80 dark:text-white/70 mt-2 text-balance">
                Step 2: Confirm your phone number
              </p>
            </div>
          </div>

          {/* Info message */}
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
            <p className="text-blue-200 text-sm">
              We sent an OTP to +{phoneNumber}
            </p>
          </div>

          {/* OTP form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="otp" className="text-white font-medium block">
                Enter OTP
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="pl-12 h-12 bg-white/10 dark:bg-white/5 border-white/30 dark:border-white/20 text-white placeholder:text-white/50 backdrop-blur-md focus:bg-white/20 dark:focus:bg-white/10 focus:border-white/50 dark:focus:border-white/30 rounded-xl text-center text-2xl tracking-widest"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-white dark:bg-white/90 text-primary hover:bg-white/90 dark:hover:bg-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white/80 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employee Check
          </button>
        </div>
      </div>
    </div>
  )
}
