import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Calendar,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Construction,
  Rocket,
} from "lucide-react"

export default function AnalyticsPage() {
  const comingSoonFeatures = [
    {
      title: "Recruitment Funnel Analysis",
      description: "Track candidates through each stage of your hiring process",
      icon: BarChart3,
      progress: 75,
      eta: "Q2 2024",
    },
    {
      title: "Time-to-Hire Metrics",
      description: "Analyze hiring speed and identify bottlenecks",
      icon: Clock,
      progress: 60,
      eta: "Q2 2024",
    },
    {
      title: "Source Performance",
      description: "Measure effectiveness of different recruitment channels",
      icon: Target,
      progress: 45,
      eta: "Q3 2024",
    },
    {
      title: "Interviewer Analytics",
      description: "Track interviewer performance and feedback quality",
      icon: Users,
      progress: 30,
      eta: "Q3 2024",
    },
    {
      title: "Diversity & Inclusion Reports",
      description: "Monitor diversity metrics across your hiring process",
      icon: PieChart,
      progress: 20,
      eta: "Q4 2024",
    },
    {
      title: "Predictive Analytics",
      description: "AI-powered insights for better hiring decisions",
      icon: Activity,
      progress: 15,
      eta: "Q4 2024",
    },
  ]

  const quickStats = [
    {
      title: "Total Hires",
      value: "156",
      change: "+23%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Avg Time to Hire",
      value: "18 days",
      change: "-12%",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      title: "Application Rate",
      value: "4.2%",
      change: "+8%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Interview Success",
      value: "68%",
      change: "+5%",
      icon: Target,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your recruitment performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Construction className="h-3 w-3 mr-1" />
            In Development
          </Badge>
        </div>
      </div>

      {/* Development Notice */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Rocket className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Advanced Analytics Coming Soon!</h3>
              <p className="text-blue-700 mt-1">
                We're building powerful analytics tools to help you make data-driven hiring decisions.
              </p>
              <Button className="mt-4" variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Get Notified When Ready
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Preview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="relative">
              <div className="absolute top-2 right-2">
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </div>
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
      </div>

      {/* Coming Soon Features */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Features</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {comingSoonFeatures.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-blue-500"></div>
              <div className="absolute top-1 right-1 text-white text-xs font-medium">NEW</div>

              <CardHeader>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="mt-1">{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Development Progress</span>
                    <span className="font-medium">{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-2" />
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      ETA: {feature.eta}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Placeholder Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative">
          <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Hiring Trends Chart</p>
              <p className="text-xs text-gray-500">Coming Soon</p>
            </div>
          </div>
          <CardHeader>
            <CardTitle>Hiring Trends</CardTitle>
            <CardDescription>Monthly hiring performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg"></div>
          </CardContent>
        </Card>

        <Card className="relative">
          <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Source Distribution</p>
              <p className="text-xs text-gray-500">Coming Soon</p>
            </div>
          </div>
          <CardHeader>
            <CardTitle>Application Sources</CardTitle>
            <CardDescription>Where your best candidates come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>

      {/* Beta Access */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Want Early Access?</h3>
              <p className="text-purple-700 mt-1 max-w-md mx-auto">
                Join our beta program to get early access to new analytics features and help shape the future of our
                platform.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Button className="bg-purple-600 hover:bg-purple-700">Join Beta Program</Button>
              <Button variant="outline" className="border-purple-300 text-purple-700">
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
