"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Mail, Phone, MapPin, Edit, FileText, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export default function EmployeeDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Back button */}
      <Link href="/dashboard/employees">
        <Button variant="ghost" className="gap-2 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </Button>
      </Link>

      {/* Employee Header */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
              CM
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">Chanda Mwansa</h1>
                <Badge className="text-sm">Active</Badge>
              </div>
              <p className="text-xl text-muted-foreground">Senior Developer</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  chanda.m@company.com
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  +260 97 123 4567
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Lusaka, Zambia
                </div>
              </div>
            </div>
            <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <FileText className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Clock className="w-4 h-4" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span className="font-medium">EMP-001</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">Engineering</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Join Date</span>
                  <span className="font-medium">Jan 15, 2022</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Employment Type</span>
                  <span className="font-medium">Full-time</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">ZMW 2,565,000</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Bonus</span>
                  <span className="font-medium">ZMW 270,000</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Benefits</span>
                  <span className="font-medium">Health, Dental, 401k</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Last Review</span>
                  <span className="font-medium">Dec 2024</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="animate-in fade-in duration-300">
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Attendance records will be displayed here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="animate-in fade-in duration-300">
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Performance metrics will be displayed here
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="animate-in fade-in duration-300">
          <Card className="shadow-md">
            <CardContent className="p-12 text-center text-muted-foreground">
              Employee documents will be displayed here
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
