import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Shield, Database, Users, CreditCard, Construction, Wrench, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Profile Settings",
      description: "Manage your personal information and preferences",
      icon: User,
      status: "available",
      items: [
        { name: "Personal Information", description: "Update your name, email, and profile picture", available: true },
        { name: "Password & Security", description: "Change password and security settings", available: true },
        { name: "Preferences", description: "Set your language and timezone preferences", available: true },
      ],
    },
    {
      title: "Notification Settings",
      description: "Control how and when you receive notifications",
      icon: Bell,
      status: "partial",
      items: [
        { name: "Email Notifications", description: "Configure email notification preferences", available: true },
        { name: "Push Notifications", description: "Manage browser and mobile push notifications", available: false },
        { name: "SMS Alerts", description: "Set up SMS notifications for urgent updates", available: false },
      ],
    },
    {
      title: "Team & Organization",
      description: "Manage team members and organization settings",
      icon: Users,
      status: "coming-soon",
      items: [
        { name: "Team Members", description: "Invite and manage team members", available: false },
        { name: "Roles & Permissions", description: "Set up user roles and access controls", available: false },
        { name: "Department Settings", description: "Configure departments and hierarchies", available: false },
      ],
    },
    {
      title: "Integration Settings",
      description: "Connect with external tools and services",
      icon: Database,
      status: "coming-soon",
      items: [
        {
          name: "Email Integration",
          description: "Connect with Gmail, Outlook, and other email providers",
          available: false,
        },
        { name: "Calendar Sync", description: "Sync interviews with Google Calendar, Outlook", available: false },
        {
          name: "Job Board Connections",
          description: "Integrate with LinkedIn, Indeed, and other job boards",
          available: false,
        },
      ],
    },
    {
      title: "Security & Privacy",
      description: "Advanced security and privacy controls",
      icon: Shield,
      status: "coming-soon",
      items: [
        { name: "Two-Factor Authentication", description: "Enable 2FA for enhanced security", available: false },
        { name: "Data Export", description: "Export your data and candidate information", available: false },
        { name: "Privacy Controls", description: "Manage data retention and privacy settings", available: false },
      ],
    },
    {
      title: "Billing & Subscription",
      description: "Manage your subscription and billing information",
      icon: CreditCard,
      status: "coming-soon",
      items: [
        { name: "Subscription Plan", description: "View and upgrade your current plan", available: false },
        { name: "Billing History", description: "Access invoices and payment history", available: false },
        { name: "Usage Analytics", description: "Monitor your platform usage and limits", available: false },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Available</Badge>
      case "partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "coming-soon":
        return <Badge className="bg-blue-100 text-blue-800">Coming Soon</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Construction className="h-3 w-3 mr-1" />
            Under Development
          </Badge>
        </div>
      </div>

      {/* Development Notice */}
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Wrench className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900">Settings Panel in Development</h3>
              <p className="text-orange-700 mt-1">
                We're actively building comprehensive settings to give you full control over your ATS experience. Some
                basic settings are available now, while advanced features are coming soon.
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <Button variant="outline" className="border-orange-300 text-orange-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Me of Updates
                </Button>
                <Button variant="ghost" className="text-orange-700">
                  View Roadmap
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Settings Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Profile Settings</span>
            <Badge className="bg-green-100 text-green-800">Available Now</Badge>
          </CardTitle>
          <CardDescription>These basic settings are currently available for use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="john@company.com" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Email Preferences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-applications">New Applications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new candidates apply</p>
                </div>
                <Switch id="new-applications" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="interview-reminders">Interview Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders before scheduled interviews</p>
                </div>
                <Switch id="interview-reminders" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {settingsSections.map((section, index) => (
          <Card key={index} className={section.status === "coming-soon" ? "opacity-75" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      section.status === "available"
                        ? "bg-green-100"
                        : section.status === "partial"
                          ? "bg-yellow-100"
                          : "bg-gray-100"
                    }`}
                  >
                    <section.icon
                      className={`h-5 w-5 ${
                        section.status === "available"
                          ? "text-green-600"
                          : section.status === "partial"
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(section.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.available ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${item.available ? "text-gray-900" : "text-gray-500"}`}>
                          {item.name}
                        </h4>
                        {!item.available && (
                          <Badge variant="outline" className="text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${item.available ? "text-gray-600" : "text-gray-400"}`}>
                        {item.description}
                      </p>
                    </div>
                    <Button variant={item.available ? "outline" : "ghost"} size="sm" disabled={!item.available}>
                      {item.available ? "Configure" : "Coming Soon"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Development Timeline */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <span>Development Roadmap</span>
          </CardTitle>
          <CardDescription>Here's what we're working on for the settings panel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">Q1</span>
              </div>
              <h4 className="font-medium text-green-900">Basic Settings</h4>
              <p className="text-sm text-green-700 mt-1">Profile, notifications, and basic preferences</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">Q2</span>
              </div>
              <h4 className="font-medium text-blue-900">Team Management</h4>
              <p className="text-sm text-blue-700 mt-1">User roles, permissions, and team settings</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">Q3</span>
              </div>
              <h4 className="font-medium text-purple-900">Advanced Features</h4>
              <p className="text-sm text-purple-700 mt-1">Integrations, security, and enterprise features</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
