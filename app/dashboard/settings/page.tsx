"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Save, Upload } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useCompanySettings } from "@/contexts/company-context"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface EmployeeDetails {
  name: string
  employee_number: string
  department: string
  job_title?: string
  phone1?: string
  phone2?: string
  address?: string
  workflow_route?: string
  [key: string]: any
}

interface CompanySettings {
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  industry?: string
  company_logo?: string
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-balance">Settings</h1>
          <p className="text-muted-foreground mt-1">Loading settings...</p>
        </div>
      </div>
    )
  }

  return <SettingsContent />
}

function SettingsContent() {
  const { theme, themeColor, compactMode, setTheme, setThemeColor, setCompactMode } = useTheme()
  const { updateCompanySettings: updateGlobalCompanySettings } = useCompanySettings()
  const { toast } = useToast()
  const [employeeData, setEmployeeData] = useState<EmployeeDetails | null>(null)
  const [companyData, setCompanyData] = useState<CompanySettings | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyFormData, setCompanyFormData] = useState<CompanySettings | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sessionRes = await fetch("/api/session")
        if (!sessionRes.ok) return

        const session = await sessionRes.json()

        // Fetch employee data - use correct session key structure
        if (session.session?.employee_number) {
          const detailsRes = await fetch(
            `/api/employee-details?manNumber=${encodeURIComponent(session.session.employee_number)}`
          )
          if (detailsRes.ok) {
            const details = await detailsRes.json()
            setEmployeeData(details)
          }

          // Check for profile picture
          const profilePic = localStorage.getItem(`profile-pic-${session.session.employee_number}`)
          if (profilePic) {
            setProfileImage(profilePic)
          }
        }

        // Fetch company settings
        const companyRes = await fetch("/api/settings/company")
        if (companyRes.ok) {
          const company = await companyRes.json()
          setCompanyData(company)
          setCompanyFormData(company)

          const storedLogo = localStorage.getItem("company-logo")
          if (storedLogo) {
            setCompanyLogo(storedLogo)
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!employeeData) return

    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("employeeNumber", employeeData.employee_number)

      const res = await fetch("/api/settings/profile-picture", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setProfileImage(data.imageUrl)
        localStorage.setItem(`profile-pic-${employeeData.employee_number}`, data.imageUrl)
        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to upload profile picture",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: "Error uploading profile picture",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setSaving(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setCompanyLogo(dataUrl)
        localStorage.setItem("company-logo", dataUrl)
        toast({
          title: "Success",
          description: "Company logo updated (preview only)",
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading company logo:", error)
      toast({
        title: "Error",
        description: "Error uploading company logo",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCompanySettings = async () => {
    if (!companyFormData) return

    try {
      setSaving(true)
      const res = await fetch("/api/settings/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyFormData),
      })

      if (res.ok) {
        setCompanyData(companyFormData)
        updateGlobalCompanySettings(companyFormData)
        localStorage.setItem("company-settings", JSON.stringify(companyFormData))
        toast({
          title: "Success",
          description: "Company settings saved successfully",
        })
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message || "Failed to save company settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving company settings:", error)
      toast({
        title: "Error",
        description: "Error saving company settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const firstName = employeeData?.name?.split(" ")[0] || ""
  const lastName = employeeData?.name?.split(" ").slice(1).join(" ") || ""

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and system preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto rounded-xl">
          <TabsTrigger value="profile" className="rounded-xl flex-1 min-w-[80px]">
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-xl flex-1 min-w-[80px]">
            Company
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-xl flex-1 min-w-[80px]">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl flex-1 min-w-[80px]">
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-xl flex-1 min-w-[80px]">
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                    {employeeData ? getInitials(employeeData.name) : "CM"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <label htmlFor="profile-pic-upload">
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </span>
                    </Button>
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={firstName || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={lastName || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">Employee Number</Label>
                  <Input
                    id="employeeNumber"
                    defaultValue={employeeData?.employee_number || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    defaultValue={employeeData?.phone1 || employeeData?.phone2 || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    defaultValue={employeeData?.department || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title</Label>
                  <Input
                    id="role"
                    defaultValue={employeeData?.job_title || ""}
                    className="rounded-xl"
                    disabled
                  />
                </div>
                {employeeData?.address && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      defaultValue={employeeData.address}
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                )}
                {employeeData?.workflow_route && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="workflowRoute">Workflow Route</Label>
                    <Input
                      id="workflowRoute"
                      defaultValue={employeeData.workflow_route}
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                )}
              </div>

              <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>Manage your organization details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="w-24 h-24 rounded-2xl object-contain shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-md">
                    <Building2 className="w-12 h-12 text-primary-foreground" />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="company-logo-upload">
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent cursor-pointer"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Change Logo
                      </span>
                    </Button>
                    <input
                      id="company-logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoUpload}
                      disabled={saving}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">PNG or SVG. Max size 1MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyFormData?.company_name || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData!,
                        company_name: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={companyFormData?.industry || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData!,
                        industry: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyFormData?.company_email || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData!,
                        company_email: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyFormData?.company_phone || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData!,
                        company_phone: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input
                    id="companyAddress"
                    value={companyFormData?.company_address || ""}
                    onChange={(e) =>
                      setCompanyFormData({
                        ...companyFormData!,
                        company_address: e.target.value,
                      })
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveCompanySettings}
                disabled={saving}
                className="rounded-2xl shadow-md hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Leave Requests</p>
                    <p className="text-sm text-muted-foreground">Get notified when employees request leave</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for new job applications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Payroll Reminders</p>
                    <p className="text-sm text-muted-foreground">Get reminded about payroll processing dates</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Performance Reviews</p>
                    <p className="text-sm text-muted-foreground">Notifications for pending performance reviews</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">System Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about system updates and maintenance</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" className="rounded-xl" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
                <Save className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your HRMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setThemeColor("blue")}
                      className={`w-12 h-12 rounded-xl bg-[oklch(0.35_0.12_250)] border-2 shadow-md transition-all ${
                        themeColor === "blue"
                          ? "border-[oklch(0.35_0.12_250)] ring-2 ring-[oklch(0.35_0.12_250)] ring-offset-2"
                          : "border-transparent hover:border-[oklch(0.35_0.12_250)]"
                      }`}
                      aria-label="Blue theme"
                    />
                    <button
                      onClick={() => setThemeColor("green")}
                      className={`w-12 h-12 rounded-xl bg-[oklch(0.45_0.15_150)] border-2 shadow-md transition-all ${
                        themeColor === "green"
                          ? "border-[oklch(0.45_0.15_150)] ring-2 ring-[oklch(0.45_0.15_150)] ring-offset-2"
                          : "border-transparent hover:border-[oklch(0.45_0.15_150)]"
                      }`}
                      aria-label="Green theme"
                    />
                    <button
                      onClick={() => setThemeColor("purple")}
                      className={`w-12 h-12 rounded-xl bg-[oklch(0.45_0.15_290)] border-2 shadow-md transition-all ${
                        themeColor === "purple"
                          ? "border-[oklch(0.45_0.15_290)] ring-2 ring-[oklch(0.45_0.15_290)] ring-offset-2"
                          : "border-transparent hover:border-[oklch(0.45_0.15_290)]"
                      }`}
                      aria-label="Purple theme"
                    />
                    <button
                      onClick={() => setThemeColor("orange")}
                      className={`w-12 h-12 rounded-xl bg-[oklch(0.50_0.18_40)] border-2 shadow-md transition-all ${
                        themeColor === "orange"
                          ? "border-[oklch(0.50_0.18_40)] ring-2 ring-[oklch(0.50_0.18_40)] ring-offset-2"
                          : "border-transparent hover:border-[oklch(0.50_0.18_40)]"
                      }`}
                      aria-label="Orange theme"
                    />
                    <button
                      onClick={() => setThemeColor("red")}
                      className={`w-12 h-12 rounded-xl bg-[oklch(0.50_0.20_20)] border-2 shadow-md transition-all ${
                        themeColor === "red"
                          ? "border-[oklch(0.50_0.20_20)] ring-2 ring-[oklch(0.50_0.20_20)] ring-offset-2"
                          : "border-transparent hover:border-[oklch(0.50_0.20_20)]"
                      }`}
                      aria-label="Red theme"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
                  <div className="space-y-1">
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing for a more compact interface</p>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Changes are applied automatically and saved to your browser.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
