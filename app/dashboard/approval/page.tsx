"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Package, ShoppingCart, Users, Truck, Calendar, Wrench } from "lucide-react"
import { PageHeader } from "@/components/page-header"

const approvalModules = [
  { name: "Leave Applications Approval", href: "/dashboard/approval/leave-applications", icon: Calendar },
  { name: "Staff Advances Approval", href: "/dashboard/approval/staff-advances", icon: Users },
  { name: "Transport Requests Approval", href: "/dashboard/approval/transport-requests", icon: Truck },
  { name: "Purchase Approval", href: "/dashboard/approval/purchase", icon: ShoppingCart },
  { name: "Work Orders Approval", href: "/dashboard/approval/work-orders", icon: Wrench },
  { name: "Stores Approval", href: "/dashboard/approval/stores", icon: Package },
]

export default function ApprovalOverviewPage() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Approvals"
        description="Approve all requests from one place"
        helpText="This is the approval hub where you can manage all pending approvals.\n\n• Select a module to view requests waiting for your approval\n• Only requests assigned to your workflow route will appear\n• Tap on a request to view details and approve or reject it\n\nModules include: Stores, Purchase, Staff Advances, Transport, Leave, and Work Orders."
      />
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {approvalModules.map((module) => {
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
                      <CardDescription>Approve {module.name.toLowerCase()}</CardDescription>
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
