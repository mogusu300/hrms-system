import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, Clock, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your HR overview"
        helpText="This is your main dashboard showing key metrics at a glance.\n\n• Quick Actions: Access common tasks like leave requests and approvals\n• Stats Cards: View employee counts, attendance, and payroll summaries\n• Recent Activity: See the latest actions across the system\n\nUse the sidebar menu to navigate to specific modules."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600 font-medium">+12</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">234</div>
            <p className="text-xs text-muted-foreground mt-1">94.4% attendance rate</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
            <Calendar className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Requires approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payroll Status</CardTitle>
            <DollarSign className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">ZMW 7.7M</div>
            <p className="text-xs text-muted-foreground mt-1">This month's total</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start rounded-xl bg-transparent">
              <Link href="/employees">
                <Users className="w-4 h-4 mr-2" />
                View All Employees
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl bg-transparent">
              <Link href="/attendance">
                <Calendar className="w-4 h-4 mr-2" />
                Approve Leave Requests
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl bg-transparent">
              <Link href="/payroll">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Payroll
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start rounded-xl bg-transparent">
              <Link href="/recruitment">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Applications
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Leave Request Pending</p>
                <p className="text-xs text-muted-foreground mt-1">Chanda Mwansa requested 3 days off starting Dec 15</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="rounded-xl h-7 text-xs">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl h-7 text-xs bg-transparent">
                    Reject
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">New Employee Onboarded</p>
                <p className="text-xs text-muted-foreground mt-1">Mulenga Banda joined as Senior Developer</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Payroll Reminder</p>
                <p className="text-xs text-muted-foreground mt-1">Process monthly payroll by December 28</p>
                <Button asChild size="sm" variant="link" className="h-auto p-0 mt-1 text-xs">
                  <Link href="/payroll">Go to Payroll</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Performance Reviews Due</p>
                <p className="text-xs text-muted-foreground mt-1">15 quarterly reviews need completion</p>
                <Button asChild size="sm" variant="link" className="h-auto p-0 mt-1 text-xs">
                  <Link href="/performance">View Reviews</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Employee distribution across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Engineering</h3>
                <Badge variant="secondary">89</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "89%" }} />
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Sales</h3>
                <Badge variant="secondary">64</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: "64%" }} />
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Marketing</h3>
                <Badge variant="secondary">42</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-2 h-2 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Operations</h3>
                <Badge variant="secondary">53</Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-chart-4 h-2 rounded-full" style={{ width: "53%" }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
