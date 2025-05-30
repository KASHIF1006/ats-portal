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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Clock,
  Star,
  Plus,
  X,
  Save,
  Eye,
  ArrowLeft,
  CheckCircle,
  Loader2, // Added Loader2
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { getFirestore, collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore"
import { app } from "@/lib/firebase"

const db = getFirestore(app)

// Define static labels for departments, consistent with CandidatePortalPage
const staticDepartmentLabels: { [key: string]: string } = {
    "frontend": "Frontend",
    "backend": "Backend",
    "software-engineer": "Software Engineer",
    "devops": "DevOps",
    "sales": "Sales",
    "finance": "Finance",
    "product": "Product Management",
    "engineering": "Engineering",
    "design": "Design",
    "marketing": "Marketing",
    "hr": "Human Resources",
    "operations": "Operations",
};


export default function NewJobPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isDraftStatus, setIsDraftStatus] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [benefits, setBenefits] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    company: "Talent Hub",
    department: "",
    location: "",
    jobType: "",
    workArrangement: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    experienceLevel: "",
    description: "",
    requirements: "",
    responsibilities: "",
    applicationDeadline: "",
    isUrgent: false,
    isRemote: false,
    requiresCoverLetter: false,
    requiresPortfolio: false,
  })

  const jobTypes = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" },
  ]

  const workArrangements = [
    { value: "on-site", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
  ]

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior Level (6-10 years)" },
    { value: "lead", label: "Lead/Principal (10+ years)" },
    { value: "executive", label: "Executive" },
  ]

  // Departments for the job creation form
  const departmentsForForm = [
    { value: "engineering", label: "Engineering" },
    { value: "product", label: "Product Management" }, // Matched with staticDepartmentLabels
    { value: "design", label: "Design" },
    { value: "marketing", label: "Marketing" },
    { value: "sales", label: "Sales" },
    { value: "finance", label: "Finance" },
    { value: "hr", label: "Human Resources" },
    { value: "operations", label: "Operations" },
    { value: "frontend", label: "Frontend" }, // Specific tech roles
    { value: "backend", label: "Backend" },
    { value: "software-engineer", label: "Software Engineer" },
    { value: "devops", label: "DevOps" },
  ]

  const commonBenefits = [
    "Health Insurance", "Dental Insurance", "Vision Insurance", "401(k) Matching",
    "Flexible PTO", "Remote Work Option", "Professional Development", "Stock Options",
    "Gym Membership", "Commuter Benefits", "Parental Leave", "Mental Health Support",
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "workArrangement" && value === "remote") {
      setFormData((prev) => ({ ...prev, isRemote: true, location: "Remote" }));
    } else if (field === "workArrangement" && value !== "remote") {
       setFormData((prev) => ({ ...prev, isRemote: false }));
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const toggleBenefit = (benefit: string) => {
    setBenefits((prev) => (prev.includes(benefit) ? prev.filter((b) => b !== benefit) : [...prev, benefit]))
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault()
    if (!formData.department) {
        setSubmitError("Department is required to categorize the job.");
        alert("Please select a department.");
        return;
    }
    // Add more comprehensive validation here if needed for other required fields.
    const requiredFields: (keyof typeof formData)[] = ['title', 'company', 'location', 'jobType', 'workArrangement', 'experienceLevel', 'description', 'requirements', 'responsibilities'];
    for (const field of requiredFields) {
        if (!formData[field] && !(field === 'location' && formData.isRemote)) { // Location not required if remote and auto-set
            const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            setSubmitError(`${fieldLabel} is required.`);
            alert(`${fieldLabel} is required.`);
            return;
        }
    }


    setIsSubmitting(true)
    setIsDraftStatus(saveAsDraft)
    setSubmitError(null);

    try {
      const jobData = {
        ...formData,
        skills,
        benefits,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        status: saveAsDraft ? "draft" : "published",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure department value is what's stored with the job too
        department: formData.department,
      };

      // Path: jobCategories/{departmentName}
      const departmentDocRef = doc(db, "jobCategories", formData.department);

      // *** MODIFICATION: Explicitly set data on the parent department document ***
      await setDoc(departmentDocRef, {
        name: staticDepartmentLabels[formData.department] || formData.department.charAt(0).toUpperCase() + formData.department.slice(1),
        value: formData.department, // Store the value/ID if different from name
        lastJobPostedAt: serverTimestamp(),
        // Add any other metadata you want for the department category itself
      }, { merge: true }); // Use merge: true to avoid overwriting existing department data if any
      // *** END MODIFICATION ***

      // Path: jobCategories/{departmentName}/jobs/{newJobId}
      const jobsCollectionRef = collection(departmentDocRef, "jobs");
      const newJobDocRef = await addDoc(jobsCollectionRef, jobData);

      console.log("Job posted with ID: ", newJobDocRef.id);
      console.log("Department document 'jobCategories/", formData.department, "' ensured to exist with fields.");
      setIsSubmitted(true)

    } catch (error) {
        console.error("Error posting job:", error);
        setSubmitError(`Failed to post job. ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent form submission if inside an input
      if (e.target === document.getElementById('newSkill')) {
        addSkill();
      }
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Job {isDraftStatus ? "Saved as Draft" : "Posted Successfully"}!
            </h2>
            <p className="text-gray-600 mb-6">
              {isDraftStatus
                ? "Your job posting has been saved as a draft. You can find and edit it later from the jobs list."
                : "Your job posting is now live and ready for candidates."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
              <Button onClick={() => router.push("/admin/jobs")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs List
              </Button>
              <Button variant="outline" onClick={() => {
                  setIsSubmitted(false);
                  setIsDraftStatus(false);
                  setSubmitError(null);
                  setFormData({
                    title: "", company: "Talent Hub", department: "", location: "",
                    jobType: "", workArrangement: "", salaryMin: "", salaryMax: "",
                    salaryCurrency: "USD", experienceLevel: "", description: "",
                    requirements: "", responsibilities: "", applicationDeadline: "",
                    isUrgent: false, isRemote: false, requiresCoverLetter: false, requiresPortfolio: false,
                  });
                  setSkills([]);
                  setBenefits([]);
              }}>
                Post Another Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post New Job</h1>
          <p className="text-muted-foreground">Create a new job posting to attract top talent</p>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
      {submitError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md">
           <p>{submitError}</p>
        </div>
      )}
      <form onSubmit={(e) => handleSubmit(e, false)} className="pb-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Briefcase className="h-5 w-5" /><span>Basic Information</span></CardTitle>
                <CardDescription>Essential details about the position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input id="title" placeholder="e.g. Senior Frontend Developer" value={formData.title} onChange={(e) => handleInputChange("title", e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input id="company" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} required />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(value) => {if(value)handleInputChange("department", value)}} required>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departmentsForForm.map((dept) => (<SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level *</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value) => {if(value)handleInputChange("experienceLevel", value)}} required>
                      <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (<SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><MapPin className="h-5 w-5" /><span>Location & Work Details</span></CardTitle>
                <CardDescription>Where and how the work will be performed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" placeholder="e.g. San Francisco, CA or Remote" value={formData.location} onChange={(e) => handleInputChange("location", e.target.value)} required disabled={formData.isRemote} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workArrangement">Work Arrangement *</Label>
                    <Select value={formData.workArrangement} onValueChange={(value) => {if(value)handleInputChange("workArrangement", value)}} required>
                      <SelectTrigger><SelectValue placeholder="Select work arrangement" /></SelectTrigger>
                      <SelectContent>
                        {workArrangements.map((arrangement) => (<SelectItem key={arrangement.value} value={arrangement.value}>{arrangement.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType">Job Type *</Label>
                  <Select value={formData.jobType} onValueChange={(value) => {if(value)handleInputChange("jobType", value)}} required>
                    <SelectTrigger><SelectValue placeholder="Select job type" /></SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><DollarSign className="h-5 w-5" /><span>Compensation</span></CardTitle>
                <CardDescription>Salary range and benefits information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input id="salaryMin" type="number" placeholder="e.g., 80000" value={formData.salaryMin} onChange={(e) => handleInputChange("salaryMin", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input id="salaryMax" type="number" placeholder="e.g., 120000" value={formData.salaryMax} onChange={(e) => handleInputChange("salaryMax", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryCurrency">Currency</Label>
                    <Select value={formData.salaryCurrency} onValueChange={(value) => {if(value)handleInputChange("salaryCurrency", value)}} >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem><SelectItem value="CAD">CAD</SelectItem>
                        <SelectItem value="PKR">PKR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Benefits & Perks</Label>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {commonBenefits.map((benefit) => (
                      <div key={benefit} className="flex items-center space-x-2">
                        <Checkbox id={`benefit-${benefit.replace(/\s+/g, '-')}`} checked={benefits.includes(benefit)} onCheckedChange={() => toggleBenefit(benefit)} />
                        <Label htmlFor={`benefit-${benefit.replace(/\s+/g, '-')}`} className="text-sm font-normal cursor-pointer">{benefit}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="h-5 w-5" /><span>Job Details</span></CardTitle>
                <CardDescription>Detailed information about the role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea id="description" placeholder="Provide a comprehensive description of the role, team culture, and what makes this opportunity exciting..." rows={6} value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibilities">Key Responsibilities *</Label>
                  <Textarea id="responsibilities" placeholder="List the primary tasks and duties, e.g.,&#10;• Lead frontend development initiatives&#10;• Collaborate with design and backend teams..." rows={5} value={formData.responsibilities} onChange={(e) => handleInputChange("responsibilities", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements & Qualifications *</Label>
                  <Textarea id="requirements" placeholder="List essential skills, experience, and qualifications, e.g.,&#10;• 5+ years of experience...&#10;• Strong proficiency in React..." rows={5} value={formData.requirements} onChange={(e) => handleInputChange("requirements", e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Star className="h-5 w-5" /><span>Required Skills</span></CardTitle>
                <CardDescription>Technical and soft skills needed for this role (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newSkill">Add Skills (press Enter or click +)</Label>
                  <div className="flex space-x-2">
                    <Input id="newSkill" placeholder="e.g. React, TypeScript, Problem Solving" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={handleKeyPress} />
                    <Button type="button" onClick={addSkill} variant="outline" aria-label="Add skill"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
                {skills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="flex items-center">
                          <span>{skill}</span>
                          <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600" aria-label={`Remove ${skill} skill`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center space-x-2"><Clock className="h-5 w-5" /><span>Job Settings</span></CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
                  <Input id="applicationDeadline" type="date" value={formData.applicationDeadline} onChange={(e) => handleInputChange("applicationDeadline", e.target.value)} />
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><Label htmlFor="isUrgent" className="cursor-pointer">Urgent Hiring</Label><p className="text-sm text-muted-foreground">Mark as priority</p></div>
                    <Switch id="isUrgent" checked={formData.isUrgent} onCheckedChange={(checked) => handleInputChange("isUrgent", Boolean(checked))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><Label htmlFor="requiresCoverLetter" className="cursor-pointer">Require Cover Letter</Label></div>
                    <Switch id="requiresCoverLetter" checked={formData.requiresCoverLetter} onCheckedChange={(checked) => handleInputChange("requiresCoverLetter", Boolean(checked))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><Label htmlFor="requiresPortfolio" className="cursor-pointer">Require Portfolio</Label></div>
                    <Switch id="requiresPortfolio" checked={formData.requiresPortfolio} onCheckedChange={(checked) => handleInputChange("requiresPortfolio", Boolean(checked))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Quick Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 p-3 bg-muted/50 rounded-md border">
                  <h3 className="font-semibold text-md truncate">{formData.title || "[Job Title]"}</h3>
                  <p className="text-sm text-muted-foreground">{formData.company}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.location && !formData.isRemote && <Badge variant="outline" className="text-xs">{formData.location}</Badge>}
                    {formData.workArrangement && <Badge variant="outline" className="text-xs">{workArrangements.find(w => w.value === formData.workArrangement)?.label}</Badge>}
                    {formData.jobType && <Badge variant="outline" className="text-xs">{jobTypes.find(j => j.value === formData.jobType)?.label}</Badge>}
                  </div>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <p className="text-xs font-medium text-muted-foreground">
                      {formData.salaryCurrency}{" "}
                      {formData.salaryMin && `${parseFloat(formData.salaryMin).toLocaleString()}`}
                      {formData.salaryMin && formData.salaryMax && " - "}
                      {formData.salaryMax && `${parseFloat(formData.salaryMax).toLocaleString()}`}
                    </p>
                  )}
                  {skills.length > 0 && (
                     <div className="mt-2 pt-1 border-t border-dashed">
                        <p className="text-xs font-medium">Skills: {skills.slice(0,3).join(', ')}{skills.length > 3 ? '...' : ''}</p>
                     </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                    {isSubmitting && !isDraftStatus ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Publishing Job...</>) : (<><Briefcase className="h-4 w-4 mr-2" />Publish Job</>)}
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-11" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting || !formData.title || !formData.department}>
                    {isSubmitting && isDraftStatus ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Saving Draft...</>) : (<><Save className="h-4 w-4 mr-2" />Save as Draft</>)}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full text-muted-foreground" asChild>
                    <Link href="/admin/jobs">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </>
  )
}