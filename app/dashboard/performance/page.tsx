"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Star, Target, Award, Plus, Calendar } from "lucide-react"

const performanceData = [
  {
    id: 1,
    employee: "Chanda Mwansa",
    initials: "CM",
    department: "Engineering",
    overallScore: 4.5,
    productivity: 92,
    quality: 88,
    teamwork: 95,
    innovation: 90,
    status: "excellent",
    lastReview: "Q4 2024",
  },
  {
    id: 2,
    employee: "Mulenga Banda",
    initials: "MB",
    department: "Product",
    overallScore: 4.2,
    productivity: 85,
    quality: 90,
    teamwork: 88,
    innovation: 82,
    status: "good",
    lastReview: "Q4 2024",
  },
  {
    id: 3,
    employee: "Thandiwe Phiri",
    initials: "TP",
    department: "Design",
    overallScore: 4.7,
    productivity: 95,
    quality: 94,
    teamwork: 92,
    innovation: 96,
    status: "excellent",
    lastReview: "Q4 2024",
  },
  {
    id: 4,
    employee: "Bwalya Zulu",
    initials: "BZ",
    department: "Sales",
    overallScore: 3.8,
    productivity: 78,
    quality: 80,
    teamwork: 75,
    innovation: 72,
    status: "satisfactory",
    lastReview: "Q4 2024",
  },
]

export default function PerformancePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Performance Management</h1>
          <p className="text-muted-foreground mt-1">Track and evaluate employee performance</p>
        </div>
        <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Performance</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.3/5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Company average</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers</CardTitle>
            <Star className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Excellent ratings</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reviews Due</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">Pending completion</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Goals Achieved</CardTitle>
            <Target className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground mt-1">This quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Reviews */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Employee Performance Reviews</CardTitle>
          <CardDescription>Recent evaluations and KPI tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((employee) => (
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            employee.status === "excellent"
                              ? "default"
                              : employee.status === "good"
                                ? "secondary"
                                : "outline"
                          }
                          className="rounded-full"
                        >
                          {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                        </Badge>
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-500">
                            {employee.overallScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Productivity</span>
                          <span className="text-xs font-semibold">{employee.productivity}%</span>
                        </div>
                        <Progress value={employee.productivity} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Quality</span>
                          <span className="text-xs font-semibold">{employee.quality}%</span>
                        </div>
                        <Progress value={employee.quality} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Teamwork</span>
                          <span className="text-xs font-semibold">{employee.teamwork}%</span>
                        </div>
                        <Progress value={employee.teamwork} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Innovation</span>
                          <span className="text-xs font-semibold">{employee.innovation}%</span>
                        </div>
                        <Progress value={employee.innovation} className="h-2" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Last Review: {employee.lastReview}</p>
                      <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Top Performers This Quarter</CardTitle>
          <CardDescription>Employees with outstanding performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold">Thandiwe Phiri</h3>
                  <p className="text-sm text-muted-foreground">Design</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                <span className="text-2xl font-bold">4.7</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Chanda Mwansa</h3>
                  <p className="text-sm text-muted-foreground">Engineering</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600 fill-blue-600" />
                <span className="text-2xl font-bold">4.5</span>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Mulenga Banda</h3>
                  <p className="text-sm text-muted-foreground">Product</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600 fill-green-600" />
                <span className="text-2xl font-bold">4.2</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
