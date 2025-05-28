import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Mail, Phone, MapPin, Calendar, Star, MoreHorizontal } from "lucide-react"

export default function CandidatesPage() {
  const candidates = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Frontend Developer",
      location: "San Francisco, CA",
      stage: "Interview",
      appliedDate: "2024-01-15",
      experience: "5+ years",
      skills: ["React", "TypeScript", "Next.js"],
      rating: 4.5,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 234-5678",
      position: "Product Manager",
      location: "Remote",
      stage: "Review",
      appliedDate: "2024-01-14",
      experience: "7+ years",
      skills: ["Product Strategy", "Analytics", "Agile"],
      rating: 4.2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 345-6789",
      position: "UX Designer",
      location: "New York, NY",
      stage: "Screening",
      appliedDate: "2024-01-13",
      experience: "4+ years",
      skills: ["Figma", "User Research", "Prototyping"],
      rating: 4.7,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@email.com",
      phone: "+1 (555) 456-7890",
      position: "Backend Developer",
      location: "Austin, TX",
      stage: "Applied",
      appliedDate: "2024-01-12",
      experience: "6+ years",
      skills: ["Node.js", "Python", "AWS"],
      rating: 4.0,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      phone: "+1 (555) 567-8901",
      position: "Marketing Manager",
      location: "Los Angeles, CA",
      stage: "Offer",
      appliedDate: "2024-01-10",
      experience: "5+ years",
      skills: ["Digital Marketing", "SEO", "Analytics"],
      rating: 4.8,
      avatar: "/placeholder.svg?height=40&width=40",
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
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">Manage and review candidate applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Import Candidates</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search candidates..." className="pl-10" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                <SelectItem value="frontend">Frontend Developer</SelectItem>
                <SelectItem value="backend">Backend Developer</SelectItem>
                <SelectItem value="product">Product Manager</SelectItem>
                <SelectItem value="design">UX Designer</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="grid gap-6">
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={candidate.avatar || "/placeholder.svg"} alt={candidate.name} />
                  <AvatarFallback>
                    {candidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{candidate.name}</h3>
                      <p className="text-muted-foreground">{candidate.position}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{candidate.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(candidate.rating)}
                        <span className="text-sm text-muted-foreground ml-1">{candidate.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{candidate.experience} experience</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button size="sm">Schedule Interview</Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
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
