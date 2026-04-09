"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const employees = [
  {
    id: "1",
    name: "Chanda Mwansa",
    role: "Senior Developer",
    department: "Engineering",
    email: "chanda.m@company.com",
    phone: "+260 97 123 4567",
    location: "Lusaka, Zambia",
    status: "Active",
    avatar: "CM",
  },
  {
    id: "2",
    name: "Mulenga Banda",
    role: "Product Manager",
    department: "Product",
    email: "mulenga.b@company.com",
    phone: "+260 96 234 5678",
    location: "Kitwe, Zambia",
    status: "Active",
    avatar: "MB",
  },
  {
    id: "3",
    name: "Thandiwe Phiri",
    role: "UX Designer",
    department: "Design",
    email: "thandiwe.p@company.com",
    phone: "+260 95 345 6789",
    location: "Ndola, Zambia",
    status: "Active",
    avatar: "TP",
  },
  {
    id: "4",
    name: "Kabwe Tembo",
    role: "HR Manager",
    department: "Human Resources",
    email: "kabwe.t@company.com",
    phone: "+260 97 456 7890",
    location: "Livingstone, Zambia",
    status: "On Leave",
    avatar: "KT",
  },
]

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all employees</p>
        </div>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search employees by name, role, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee, index) => (
          <Link key={employee.id} href={`/dashboard/employees/${employee.id}`}>
            <Card
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                      {employee.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <Badge variant={employee.status === "Active" ? "default" : "secondary"}>{employee.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{employee.location}</span>
                </div>
                <div className="pt-2">
                  <Badge variant="outline">{employee.department}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
