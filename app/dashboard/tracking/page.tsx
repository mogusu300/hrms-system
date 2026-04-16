import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Package, ShoppingCart, Users, Truck, Calendar, Wrench } from "lucide-react"
import { PageHeader } from "@/components/page-header"

const trackingModules = [
  { name: "Leave Applications", href: "/dashboard/reports/leave-applications", icon: Calendar },
  { name: "Staff Advances", href: "/dashboard/reports/staff-advances-tracking", icon: Users },
  { name: "Transport Requests", href: "/dashboard/reports/transport-requests-tracking", icon: Truck },
  { name: "Purchase Requisition", href: "/dashboard/reports/purchase-tracking", icon: ShoppingCart },
  { name: "Work Orders", href: "/dashboard/reports/work-orders", icon: Wrench },
  { name: "Stores Requisition", href: "/dashboard/reports/stores-tracking", icon: Package },
]

export default function TrackingOverviewPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Request Tracking"
        description="Track and monitor the status of all your requests"
        helpText="Use this section to monitor the status of requests you have submitted.\n\n• Each module shows your submitted requests with their current status\n• Filter by status (Pending, Approved, Rejected) to find specific items\n• Click on any request to view full details and approval history\n\nRequests are pulled in real-time from the ERP system."
      />
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackingModules.map((module) => {
              const IconComponent = module.icon
              return (
                <Link key={module.name} href={module.href} className="group">
                  <Card className="shadow-md hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>View and manage {module.name.toLowerCase()}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
