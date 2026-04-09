"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DevChangePasswordPage() {
  const [employeeNumber, setEmployeeNumber] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    // Validation
    if (!employeeNumber || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/dev/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeNumber,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const detail = data.error ? ` (${data.error})` : ''
        setError((data.message || "Failed to change password") + detail)
        return
      }

      setSuccess(true)
      setSuccessMessage(`Password changed for employee ${employeeNumber}`)
      setEmployeeNumber("")
      setNewPassword("")
      setConfirmPassword("")

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
        setSuccessMessage("")
      }, 5000)
    } catch (err: any) {
      setError(err.message || "An error occurred while changing password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Developer Tools</h1>
          <p className="text-slate-400">Change password for any employee (Development Only)</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Change Employee Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter the employee number and new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-600 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="employeeNumber" className="text-slate-200">
                  Employee Number
                </Label>
                <Input
                  id="employeeNumber"
                  type="text"
                  placeholder="e.g., M1114"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())}
                  disabled={loading}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-200">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmployeeNumber("")
                    setNewPassword("")
                    setConfirmPassword("")
                    setError("")
                  }}
                  disabled={loading}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-3">
                <strong>Recent Activity:</strong>
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p>• This page allows changing passwords for any employee</p>
                <p>• Intended for development and testing only</p>
                <p>• Check browser console for detailed API logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
