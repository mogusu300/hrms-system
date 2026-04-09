"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Download, FileText, TrendingUp, Calendar, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const payrollData = [
  {
    id: 1,
    employee: "Chanda Mwansa",
    initials: "CM",
    department: "Engineering",
    baseSalary: 2565000,
    bonus: 135000,
    deductions: 229500,
    netPay: 2470500,
    status: "processed",
  },
  {
    id: 2,
    employee: "Mulenga Banda",
    initials: "MB",
    department: "Product",
    baseSalary: 2376000,
    bonus: 108000,
    deductions: 210600,
    netPay: 2273400,
    status: "processed",
  },
  {
    id: 3,
    employee: "Thandiwe Phiri",
    initials: "TP",
    department: "Design",
    baseSalary: 2214000,
    bonus: 94500,
    deductions: 194400,
    netPay: 2114100,
    status: "pending",
  },
  {
    id: 4,
    employee: "Bwalya Zulu",
    initials: "BZ",
    department: "Sales",
    baseSalary: 2025000,
    bonus: 216000,
    deductions: 183600,
    netPay: 2057400,
    status: "pending",
  },
]

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState("december-2024")

  const totalPayroll = payrollData.reduce((sum, emp) => sum + emp.netPay, 0)
  const processedCount = payrollData.filter((emp) => emp.status === "processed").length
  const pendingCount = payrollData.filter((emp) => emp.status === "pending").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Payroll & Compensation</h1>
          <p className="text-muted-foreground mt-1">Manage employee salaries and compensation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl shadow-md bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
            <FileText className="w-4 h-4 mr-2" />
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll</CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">ZMW {(totalPayroll / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processed</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{processedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Employees paid</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Salary</CardTitle>
            <TrendingUp className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">ZMW {(totalPayroll / payrollData.length / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground mt-1">Per employee</p>
          </CardContent>
        </Card>
      </div>

      {/* Month Selector */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Period:</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-64 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="december-2024">December 2024</SelectItem>
                <SelectItem value="november-2024">November 2024</SelectItem>
                <SelectItem value="october-2024">October 2024</SelectItem>
                <SelectItem value="september-2024">September 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Employee Payroll</CardTitle>
          <CardDescription>Detailed salary breakdown for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payrollData.map((employee) => (
              <div key={employee.id} className="p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {employee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold">{employee.employee}</h3>
                        <p className="text-sm text-muted-foreground">{employee.department}</p>
                      </div>
                      <Badge
                        variant={employee.status === "processed" ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Base Salary</p>
                        <p className="font-semibold">ZMW {employee.baseSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Bonus</p>
                        <p className="font-semibold text-green-600">+ZMW {employee.bonus.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Deductions</p>
                        <p className="font-semibold text-red-600">-ZMW {employee.deductions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Net Pay</p>
                        <p className="font-bold text-primary">ZMW {employee.netPay.toLocaleString()}</p>
                      </div>
                      <div className="flex items-end">
                        <Button size="sm" variant="outline" className="rounded-xl w-full bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          View Slip
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Department Salary Distribution</CardTitle>
          <CardDescription>Total compensation by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Engineering</h3>
              <p className="text-2xl font-bold text-primary">ZMW 2.6M</p>
              <p className="text-xs text-muted-foreground mt-1">89 employees</p>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Sales</h3>
              <p className="text-2xl font-bold text-accent">ZMW 2.1M</p>
              <p className="text-xs text-muted-foreground mt-1">64 employees</p>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Design</h3>
              <p className="text-2xl font-bold text-chart-2">ZMW 2.1M</p>
              <p className="text-xs text-muted-foreground mt-1">42 employees</p>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <h3 className="font-semibold mb-2">Product</h3>
              <p className="text-2xl font-bold text-chart-4">ZMW 2.3M</p>
              <p className="text-xs text-muted-foreground mt-1">53 employees</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
