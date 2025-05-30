import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Calendar, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const stats = [
    {
      title: "Total Applications",
      value: "1,247",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Jobs",
      value: "23",
      change: "+3",
      icon: Briefcase,
      color: "text-green-600",
    },
    // {
    //   title: "Interviews Scheduled",
    //   value: "18",
    //   change: "+5",
    //   icon: Calendar,
    //   color: "text-purple-600",
    // },
    {
      title: "Hire Rate",
      value: "24%",
      change: "+2%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentApplications = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Frontend Developer",
      stage: "Interview",
      appliedDate: "2024-01-15",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Product Manager",
      stage: "Review",
      appliedDate: "2024-01-14",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "UX Designer",
      stage: "Screening",
      appliedDate: "2024-01-13",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "David Kim",
      position: "Backend Developer",
      stage: "Applied",
      appliedDate: "2024-01-12",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const upcomingInterviews = [
    {
      id: 1,
      candidate: "Sarah Johnson",
      position: "Senior Frontend Developer",
      time: "10:00 AM",
      date: "Today",
      type: "In Progress",
    },
    {
      id: 2,
      candidate: "Alex Thompson",
      position: "Product Manager",
      time: "2:30 PM",
      date: "Today",
      type: "Final",
    },
    {
      id: 3,
      candidate: "Maria Garcia",
      position: "UX Designer",
      time: "11:00 AM",
      date: "Tomorrow",
      type: "Portfolio Review",
    },
  ]

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Applied":
        return "bg-gray-100 text-gray-800"
      case "Screening":
        return "bg-blue-100 text-blue-800"
      case "Review":
        return "bg-yellow-100 text-yellow-800"
      case "Interview":
        return "bg-purple-100 text-purple-800"
      case "Offer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your recruitment.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest candidate applications across all positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {application.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{application.name}</p>
                    <p className="text-sm text-muted-foreground">{application.position}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStageColor(application.stage)}>{application.stage}</Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/candidates">View All Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
            <CardDescription>Current job openings accepting applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{interview.candidate}</p>
                    <p className="text-sm text-muted-foreground">{interview.position}</p>
                    {/* <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {interview.time} • {interview.date}
                      </span>
                    </div> */}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{interview.type}</Badge>
                    {/* <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button> */}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you manage your recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-2" asChild>
              <Link href="/jobs/new">
                <Briefcase className="h-6 w-6" />
                <span>Post New Job</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link href="/candidates">
                <Users className="h-6 w-6" />
                <span>Review Applications</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
              <Link href="/interviews">
                <Calendar className="h-6 w-6" />
                <span>Schedule Interview</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
