"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const leaveRequests = [
  {
    id: 1,
    employee: "Chanda Mwansa",
    initials: "CM",
    type: "Annual Leave",
    startDate: "Dec 15, 2024",
    endDate: "Dec 17, 2024",
    days: 3,
    status: "pending",
    reason: "Family vacation",
  },
  {
    id: 2,
    employee: "Mulenga Banda",
    initials: "MB",
    type: "Sick Leave",
    startDate: "Dec 10, 2024",
    endDate: "Dec 11, 2024",
    days: 2,
    status: "approved",
    reason: "Medical appointment",
  },
  {
    id: 3,
    employee: "Thandiwe Phiri",
    initials: "TP",
    type: "Personal Leave",
    startDate: "Dec 20, 2024",
    endDate: "Dec 20, 2024",
    days: 1,
    status: "pending",
    reason: "Personal matters",
  },
  {
    id: 4,
    employee: "Bwalya Zulu",
    initials: "BZ",
    type: "Annual Leave",
    startDate: "Dec 5, 2024",
    endDate: "Dec 6, 2024",
    days: 2,
    status: "rejected",
    reason: "Holiday trip",
  },
]

const attendanceData = [
  { date: "Dec 16, 2024", present: 234, absent: 8, onLeave: 6, total: 248 },
  { date: "Dec 15, 2024", present: 238, absent: 5, onLeave: 5, total: 248 },
  { date: "Dec 14, 2024", present: 240, absent: 4, onLeave: 4, total: 248 },
  { date: "Dec 13, 2024", present: 236, absent: 7, onLeave: 5, total: 248 },
]

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Attendance & Leave Management</h1>
          <p className="text-muted-foreground mt-1">Track attendance and manage leave requests</p>
        </div>
        <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">234</div>
            <p className="text-xs text-muted-foreground mt-1">94.4% of total employees</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">Approved leave today</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            <XCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Unplanned absences</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
            <AlertCircle className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 rounded-xl">
          <TabsTrigger value="overview" className="rounded-xl">
            Overview
          </TabsTrigger>
          <TabsTrigger value="leave-requests" className="rounded-xl">
            Leave Requests
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-xl">
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
              <CardDescription>Daily attendance summary for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceData.map((day, index) => (
                  <div key={index} className="p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{day.date}</h3>
                      <Badge variant="secondary">{day.total} Total</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-2xl font-bold">{day.present}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-2xl font-bold">{day.onLeave}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">On Leave</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-2xl font-bold">{day.absent}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-requests" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Manage employee leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-xl border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {request.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{request.employee}</h3>
                            <p className="text-sm text-muted-foreground">{request.type}</p>
                          </div>
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : request.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="rounded-full"
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {request.startDate} - {request.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{request.days} days</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                        {request.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="rounded-xl">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>December 2024</CardTitle>
              <CardDescription>Monthly attendance and leave calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Calendar Header */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                {/* Calendar Days */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hasLeave = [15, 16, 17, 20].includes(day)
                  const isToday = day === 16
                  return (
                    <div
                      key={day}
                      className={`aspect-square p-2 rounded-xl border text-center flex flex-col items-center justify-center transition-colors ${
                        isToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : hasLeave
                            ? "bg-orange-100 border-orange-300 dark:bg-orange-900/20"
                            : "bg-card hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-sm">{day}</span>
                      {hasLeave && !isToday && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 mt-1">Leave</span>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
                  <span>Leave Days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
