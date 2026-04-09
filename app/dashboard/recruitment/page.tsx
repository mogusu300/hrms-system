"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Plus, Search, Users, Clock, CheckCircle, Mail, Phone, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const jobPostings = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    applicants: 24,
    status: "active",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    applicants: 18,
    status: "active",
    posted: "5 days ago",
  },
  {
    id: 3,
    title: "UX/UI Designer",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    applicants: 32,
    status: "active",
    posted: "1 week ago",
  },
  {
    id: 4,
    title: "Sales Representative",
    department: "Sales",
    location: "Chicago, IL",
    type: "Full-time",
    applicants: 15,
    status: "closed",
    posted: "2 weeks ago",
  },
]

const candidates = [
  {
    id: 1,
    name: "Mutale Sakala",
    initials: "MS",
    position: "Senior Full Stack Developer",
    email: "mutale.s@email.com",
    phone: "+260 97 234 5678",
    location: "Lusaka, Zambia",
    experience: "8 years",
    status: "interview",
    appliedDate: "Dec 14, 2024",
  },
  {
    id: 2,
    name: "Natasha Lungu",
    initials: "NL",
    position: "Product Manager",
    email: "natasha.l@email.com",
    phone: "+260 96 345 6789",
    location: "Kitwe, Zambia",
    experience: "6 years",
    status: "shortlisted",
    appliedDate: "Dec 13, 2024",
  },
  {
    id: 3,
    name: "Chisomo Nyirenda",
    initials: "CN",
    position: "UX/UI Designer",
    email: "chisomo.n@email.com",
    phone: "+260 95 456 7890",
    location: "Ndola, Zambia",
    experience: "5 years",
    status: "new",
    appliedDate: "Dec 15, 2024",
  },
  {
    id: 4,
    name: "Lubasi Mwape",
    initials: "LM",
    position: "Senior Full Stack Developer",
    email: "lubasi.m@email.com",
    phone: "+260 97 567 8901",
    location: "Livingstone, Zambia",
    experience: "7 years",
    status: "rejected",
    appliedDate: "Dec 10, 2024",
  },
]

export default function RecruitmentPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Recruitment</h1>
          <p className="text-muted-foreground mt-1">Manage job postings and candidate applications</p>
        </div>
        <Button className="rounded-2xl shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
            <Briefcase className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Open positions</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
            <Users className="w-5 h-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Interview</CardTitle>
            <Clock className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-1">Active candidates</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hired</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 rounded-xl">
          <TabsTrigger value="candidates" className="rounded-xl">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-xl">
            Job Postings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          {/* Filters */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Candidates List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                        {candidate.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">{candidate.position}</p>
                        </div>
                        <Badge
                          variant={
                            candidate.status === "interview"
                              ? "default"
                              : candidate.status === "shortlisted"
                                ? "secondary"
                                : candidate.status === "rejected"
                                  ? "destructive"
                                  : "outline"
                          }
                          className="rounded-full"
                        >
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{candidate.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span>{candidate.experience} experience</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="rounded-xl">
                          View Profile
                        </Button>
                        {candidate.status === "new" && (
                          <>
                            <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                              Shortlist
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                              Reject
                            </Button>
                          </>
                        )}
                        {candidate.status === "shortlisted" && (
                          <Button size="sm" variant="outline" className="rounded-xl bg-transparent">
                            Schedule Interview
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id} className="shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="mt-1">{job.department}</CardDescription>
                    </div>
                    <Badge variant={job.status === "active" ? "default" : "secondary"} className="rounded-full">
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{job.applicants} applicants</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Posted {job.posted}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 rounded-xl bg-transparent">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 rounded-xl">
                      View Applicants
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
