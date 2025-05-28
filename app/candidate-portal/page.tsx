"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  CheckCircle,
  Mail,
  User,
  Briefcase,
  Building2,
  Star,
  Users,
  Award,
  Heart,
  ArrowRight,
  X,
} from "lucide-react"

export default function CandidatePortalPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    coverLetter: "",
    linkedIn: "",
    portfolio: "",
  })

  const departments = [
    { value: "engineering", label: "Engineering", openings: 8 },
    { value: "product", label: "Product Management", openings: 3 },
    { value: "design", label: "Design", openings: 4 },
    { value: "marketing", label: "Marketing", openings: 5 },
    { value: "sales", label: "Sales", openings: 6 },
    { value: "hr", label: "Human Resources", openings: 2 },
    { value: "finance", label: "Finance", openings: 3 },
    { value: "operations", label: "Operations", openings: 4 },
  ]

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or Word document")
        return
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in joining our team. We've received your application and will review it
              shortly.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>• You'll receive a confirmation email within 5 minutes</p>
              <p>• Our team will review your application within 2-3 business days</p>
              <p>• We'll contact you if your profile matches our requirements</p>
            </div>
            <Button className="mt-6 w-full" onClick={() => window.close()}>
              Close Window
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TH</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Talent Hub</h1>
                <p className="text-sm text-gray-500">Join Our Amazing Team</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">We're Hiring!</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals who are passionate about innovation and growth. Submit your
            application and let's build something amazing together.
          </p>
        </div>

        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">500+</div>
            <div className="text-sm text-gray-500">Team Members</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">4.8/5</div>
            <div className="text-sm text-gray-500">Employee Rating</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">15+</div>
            <div className="text-sm text-gray-500">Awards Won</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-sm text-gray-500">Retention Rate</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Submit Your Application</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below to apply for a position at Talent Hub. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Personal Information</span>
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+1 (555) 123-4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          placeholder="https://linkedin.com/in/johndoe"
                          value={formData.linkedIn}
                          onChange={(e) => handleInputChange("linkedIn", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Position Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Briefcase className="h-5 w-5" />
                      <span>Position Details</span>
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleInputChange("department", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.value} value={dept.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{dept.label}</span>
                                  <Badge variant="secondary" className="ml-2">
                                    {dept.openings} openings
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Specific Position</Label>
                        <Input
                          id="position"
                          placeholder="e.g., Senior Frontend Developer"
                          value={formData.position}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio/Website</Label>
                      <Input
                        id="portfolio"
                        placeholder="https://yourportfolio.com"
                        value={formData.portfolio}
                        onChange={(e) => handleInputChange("portfolio", e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Resume Upload */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Resume Upload</span>
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume/CV *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                        <label htmlFor="resume" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">
                            {selectedFile ? selectedFile.name : "Click to upload your resume"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX up to 5MB</p>
                        </label>
                        {selectedFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cover Letter */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Mail className="h-5 w-5" />
                      <span>Cover Letter</span>
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">Tell us about yourself (Optional)</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Why are you interested in this position? What makes you a great fit for our team?"
                        rows={4}
                        value={formData.coverLetter}
                        onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full h-12 text-lg"
                      disabled={
                        isSubmitting || !selectedFile || !formData.fullName || !formData.email || !formData.department
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Why Join Us */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Why Join Talent Hub?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Competitive Compensation</h4>
                      <p className="text-sm text-gray-600">Market-leading salaries and equity packages</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Flexible Work</h4>
                      <p className="text-sm text-gray-600">Remote-first culture with flexible hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Growth Opportunities</h4>
                      <p className="text-sm text-gray-600">Continuous learning and career development</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Great Benefits</h4>
                      <p className="text-sm text-gray-600">Health, dental, vision, and wellness programs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Process */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Submit Application</h4>
                      <p className="text-sm text-gray-600">Complete the form and upload your resume</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Initial Review</h4>
                      <p className="text-sm text-gray-600">Our team reviews your application (2-3 days)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Interview Process</h4>
                      <p className="text-sm text-gray-600">Phone/video interviews with our team</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Final Decision</h4>
                      <p className="text-sm text-gray-600">Offer and onboarding process</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Have questions about the position or application process? We're here to help!
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>careers@talenthub.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 Talent Hub. All rights reserved.</p>
            <p className="mt-1">
              By submitting this application, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
