import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Video, MapPin, User, Plus, Search, Filter, MoreHorizontal } from "lucide-react"

export default function InterviewsPage() {
  const interviews = [
    {
      id: 1,
      candidate: "Sarah Johnson",
      position: "Senior Frontend Developer",
      interviewer: "John Smith",
      date: "2024-01-20",
      time: "10:00 AM",
      duration: "60 min",
      type: "Technical",
      format: "Video Call",
      status: "Scheduled",
      location: "Zoom Meeting",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      candidate: "Michael Chen",
      position: "Product Manager",
      interviewer: "Jane Doe",
      date: "2024-01-20",
      time: "2:30 PM",
      duration: "45 min",
      type: "Final",
      format: "In-Person",
      status: "Scheduled",
      location: "Conference Room A",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      candidate: "Emily Rodriguez",
      position: "UX Designer",
      interviewer: "Alex Wilson",
      date: "2024-01-21",
      time: "11:00 AM",
      duration: "90 min",
      type: "Portfolio Review",
      format: "Video Call",
      status: "Scheduled",
      location: "Google Meet",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      candidate: "David Kim",
      position: "Backend Developer",
      interviewer: "Sarah Connor",
      date: "2024-01-19",
      time: "3:00 PM",
      duration: "60 min",
      type: "Technical",
      format: "Video Call",
      status: "Completed",
      location: "Zoom Meeting",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      candidate: "Lisa Wang",
      position: "Marketing Manager",
      interviewer: "Tom Brown",
      date: "2024-01-22",
      time: "1:00 PM",
      duration: "45 min",
      type: "Behavioral",
      format: "Phone Call",
      status: "Scheduled",
      location: "Phone Interview",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Rescheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Technical":
        return "bg-purple-100 text-purple-800"
      case "Behavioral":
        return "bg-orange-100 text-orange-800"
      case "Final":
        return "bg-green-100 text-green-800"
      case "Portfolio Review":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isToday = (date: string) => {
    const today = new Date().toISOString().split("T")[0]
    return date === today
  }

  const isTomorrow = (date: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date === tomorrow.toISOString().split("T")[0]
  }

  const formatDate = (date: string) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Manage and schedule candidate interviews</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">52m</div>
            <p className="text-xs text-muted-foreground">Per interview</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search interviews..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="portfolio">Portfolio Review</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="grid gap-6">
        {interviews.map((interview) => (
          <Card key={interview.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={interview.avatar || "/placeholder.svg"} alt={interview.candidate} />
                  <AvatarFallback>
                    {interview.candidate
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{interview.candidate}</h3>
                      <p className="text-muted-foreground">{interview.position}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                      <Badge className={getTypeColor(interview.type)}>{interview.type}</Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(interview.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {interview.time} ({interview.duration})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{interview.interviewer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {interview.format === "Video Call" ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span>{interview.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Format:</span>
                      <Badge variant="outline">{interview.format}</Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      {interview.status === "Scheduled" && (
                        <>
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button size="sm">{interview.format === "Video Call" ? "Join Call" : "View Details"}</Button>
                        </>
                      )}
                      {interview.status === "Completed" && (
                        <Button variant="outline" size="sm">
                          View Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
