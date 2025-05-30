"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Loader2,
} from "lucide-react"

import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, doc, setDoc } from "firebase/firestore"
import { app } from "@/lib/firebase"

const db = getFirestore(app)

async function uploadFileToS3(file: File): Promise<string> {
  console.log("Requesting pre-signed URL for:", file.name);
  try {
    const response = await fetch('/api/s3-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get pre-signed URL from server.');
    }

    const { uploadUrl, finalUrl } = await response.json();

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      const s3ErrorText = await uploadResponse.text();
      console.error("S3 Upload Error Response:", s3ErrorText);
      throw new Error(`S3 Upload Failed: ${uploadResponse.status} - ${s3ErrorText.substring(0, 200)}`);
    }

    console.log("File uploaded successfully to S3.");
    return finalUrl;
  } catch (error) {
    console.error("Error in S3 upload process:", error);
    throw error;
  }
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  experienceLevel: string;
}

const staticExperienceLevelLabels: { [key: string]: string } = {
    "entry": "Entry Level (0-2 years)",
    "mid": "Mid Level (3-5 years)",
    "senior": "Senior Level (6-10 years)",
    "lead": "Lead/Principal (10+ years)",
    "executive": "Executive",
};

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


export default function CandidatePortalPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [allActiveJobs, setAllActiveJobs] = useState<JobPosting[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    experienceLevel: "",
    selectedJobId: "",
    linkedIn: "",
    portfolio: "",
  })

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      const fetchedJobs: JobPosting[] = [];
      try {
        const jobCategoriesCollectionRef = collection(db, "jobCategories");
        const departmentSnapshot = await getDocs(jobCategoriesCollectionRef);

        for (const deptDoc of departmentSnapshot.docs) {
          const departmentId = deptDoc.id;
          const jobsQuery = query(
            collection(db, "jobCategories", departmentId, "jobs"),
            where("status", "==", "published")
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          jobsSnapshot.forEach((jobDoc) => {
            const jobData = jobDoc.data();
            fetchedJobs.push({
              id: jobDoc.id,
              title: jobData.title,
              department: departmentId,
              experienceLevel: jobData.experienceLevel,
            });
          });
        }
        setAllActiveJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching active jobs:", error);
        setSubmitError("Failed to load job listings. Please try again later.");
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const availableDepartments = useMemo(() => {
    if (isLoadingJobs || allActiveJobs.length === 0) return [];
    const uniqueDepts = new Set(allActiveJobs.map(job => job.department));
    return Array.from(uniqueDepts).map(deptValue => ({
      value: deptValue,
      label: staticDepartmentLabels[deptValue] || deptValue.charAt(0).toUpperCase() + deptValue.slice(1),
    }));
  }, [allActiveJobs, isLoadingJobs]);

  const availableExperienceLevels = useMemo(() => {
    if (isLoadingJobs || !formData.department || allActiveJobs.length === 0) return [];
    const uniqueLevels = new Set(
      allActiveJobs
        .filter(job => job.department === formData.department)
        .map(job => job.experienceLevel)
    );
    return Array.from(uniqueLevels).map(levelValue => ({
      value: levelValue,
      label: staticExperienceLevelLabels[levelValue] || levelValue.charAt(0).toUpperCase() + levelValue.slice(1),
    }));
  }, [allActiveJobs, formData.department, isLoadingJobs]);

  const availableJobTitles = useMemo(() => {
    if (isLoadingJobs || !formData.department || !formData.experienceLevel || allActiveJobs.length === 0) return [];
    return allActiveJobs
      .filter(job => job.department === formData.department && job.experienceLevel === formData.experienceLevel)
      .map(job => ({
        value: job.id,
        label: job.title,
      }));
  }, [allActiveJobs, formData.department, formData.experienceLevel, isLoadingJobs]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload a PDF or Word document.");
        event.target.value = "";
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        event.target.value = "";
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newState = { ...prev, [field]: value };
      if (field === "department") {
        newState.experienceLevel = "";
        newState.selectedJobId = "";
      }
      if (field === "experienceLevel") {
        newState.selectedJobId = "";
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.department || !formData.experienceLevel || !formData.selectedJobId) {
      alert("Please select a department, experience level, specific job, and upload your resume.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const s3ResumeUrl = await uploadFileToS3(selectedFile);
      if (!s3ResumeUrl) throw new Error("Failed to get S3 URL for the resume.");

      const candidateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        departmentApplied: formData.department,
        experienceLevelApplied: formData.experienceLevel,
        jobIdApplied: formData.selectedJobId,
        linkedIn: formData.linkedIn,
        portfolio: formData.portfolio,
        resumeUrl: s3ResumeUrl,
        originalFileName: selectedFile.name,
        submittedAt: serverTimestamp(),
        status: "Received",
      };

      const parentDepartmentDocRef = doc(db, "candidateCategories", formData.department);

      await setDoc(parentDepartmentDocRef, {
        name: staticDepartmentLabels[formData.department] || formData.department.charAt(0).toUpperCase() + formData.department.slice(1),
        value: formData.department,
        lastApplicationAt: serverTimestamp(),
      }, { merge: true });

      const candidatesSubCollectionRef = collection(parentDepartmentDocRef, "candidates");
      await addDoc(candidatesSubCollectionRef, candidateData);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setSubmitError(`Failed to submit application. ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Thank you! We've received your application and will review it shortly.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <p>• Our team will review your application within 2-3 business days.</p>
              <p>• We'll contact you if your profile matches our requirements.</p>
            </div>
            <Button className="mt-6 w-full" onClick={() => {
              setIsSubmitted(false);
              setSelectedFile(null);
              setFormData({
                fullName: "", email: "", phone: "", department: "",
                experienceLevel: "", selectedJobId: "", linkedIn: "", portfolio: "",
              });
              const resumeInput = document.getElementById('resume') as HTMLInputElement;
              if (resumeInput) resumeInput.value = "";
            }}>
              Submit Another Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals. Submit your application and let's build something amazing.
          </p>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"><Users className="h-6 w-6 text-blue-600" /></div>
            <div className="text-2xl font-bold text-gray-900">500+</div><div className="text-sm text-gray-500">Team Members</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><Star className="h-6 w-6 text-green-600" /></div>
            <div className="text-2xl font-bold text-gray-900">4.8/5</div><div className="text-sm text-gray-500">Employee Rating</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"><Award className="h-6 w-6 text-purple-600" /></div>
            <div className="text-2xl font-bold text-gray-900">15+</div><div className="text-sm text-gray-500">Awards Won</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2"><Heart className="h-6 w-6 text-red-600" /></div>
            <div className="text-2xl font-bold text-gray-900">95%</div><div className="text-sm text-gray-500">Retention Rate</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><FileText className="h-5 w-5" /><span>Submit Your Application</span></CardTitle>
                <CardDescription>Fill out the form below to apply for an open position.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitError && ( <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md"><p>{submitError}</p></div> )}
                {isLoadingJobs && (
                    <div className="flex items-center justify-center p-6 space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <p className="text-gray-600">Loading available positions...</p>
                    </div>
                )}
                {!isLoadingJobs && allActiveJobs.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No open positions available at the moment. Please check back later.</p>
                    </div>
                )}
                {!isLoadingJobs && allActiveJobs.length > 0 && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2"><User className="h-5 w-5" /><span>Personal Information</span></h3>
                        <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" placeholder="John Doe" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required /></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} /></div>
                        <div className="space-y-2"><Label htmlFor="linkedIn">LinkedIn Profile</Label><Input id="linkedIn" placeholder="https://linkedin.com/in/johndoe" value={formData.linkedIn} onChange={(e) => handleInputChange("linkedIn", e.target.value)} /></div>
                        </div>
                    </div>
                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2"><Briefcase className="h-5 w-5" /><span>Select Position</span></h3>
                        <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select value={formData.department} onValueChange={(value) => { if (value) handleInputChange("department", value); }} required>
                            <SelectTrigger disabled={availableDepartments.length === 0}><SelectValue placeholder="Select department" /></SelectTrigger>
                            <SelectContent>
                            {availableDepartments.map((dept) => ( <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem> ))}
                            </SelectContent>
                        </Select>
                        </div>

                        {formData.department && (
                        <div className="space-y-2">
                            <Label htmlFor="experienceLevel">Experience Level *</Label>
                            <Select value={formData.experienceLevel} onValueChange={(value) => { if (value) handleInputChange("experienceLevel", value); }} required disabled={availableExperienceLevels.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                            <SelectContent>
                                {availableExperienceLevels.map((level) => ( <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>))}
                            </SelectContent>
                            </Select>
                        </div>
                        )}

                        {formData.department && formData.experienceLevel && (
                        <div className="space-y-2">
                            <Label htmlFor="selectedJobId">Job Title *</Label>
                            <Select value={formData.selectedJobId} onValueChange={(value) => { if (value) handleInputChange("selectedJobId", value); }} required disabled={availableJobTitles.length === 0}>
                            <SelectTrigger><SelectValue placeholder="Select specific job title" /></SelectTrigger>
                            <SelectContent>
                                {availableJobTitles.length > 0 ? (
                                    availableJobTitles.map((job) => ( <SelectItem key={job.value} value={job.value}>{job.label}</SelectItem> ))
                                ) : (
                                    <SelectItem value="" disabled>No jobs match this criteria</SelectItem>
                                )}
                            </SelectContent>
                            </Select>
                        </div>
                        )}

                        <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio/Website (Optional)</Label>
                        <Input id="portfolio" placeholder="https://yourportfolio.com" value={formData.portfolio} onChange={(e) => handleInputChange("portfolio", e.target.value)} />
                        </div>
                    </div>
                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2"><Upload className="h-5 w-5" /><span>Resume Upload</span></h3>
                        <div className="space-y-2">
                        <Label htmlFor="resume">Resume/CV *</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input id="resume" type="file" accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} className="hidden" />
                            <label htmlFor="resume" className="cursor-pointer">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">
                                {selectedFile ? selectedFile.name : "Click to upload your resume"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX up to 5MB</p>
                            </label>
                            {selectedFile && ( <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => {
                                setSelectedFile(null);
                                const resumeInput = document.getElementById('resume') as HTMLInputElement;
                                if (resumeInput) resumeInput.value = "";
                                }}> <X className="h-4 w-4 mr-1" /> Remove </Button>
                            )}
                        </div>
                        </div>
                    </div>
                    <Separator />

                    <div className="pt-4">
                        <Button type="submit" className="w-full h-12 text-lg" disabled={ isSubmitting || !selectedFile || !formData.fullName || !formData.email || !formData.selectedJobId }>
                        {isSubmitting ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin"/> Submitting Application...</>) : (<>Submit Application <ArrowRight className="h-4 w-4 ml-2" /></>)}
                        </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center space-x-2"><Building2 className="h-5 w-5" /><span>Why Join Talent Hub?</span></CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                    <div><h4 className="font-medium">Competitive Compensation</h4><p className="text-sm text-gray-600">Market-leading salaries and equity packages.</p></div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                    <div><h4 className="font-medium">Flexible Work</h4><p className="text-sm text-gray-600">Remote-first culture with flexible hours.</p></div>
                  </div>
                   <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                    <div><h4 className="font-medium">Growth Opportunities</h4><p className="text-sm text-gray-600">Continuous learning and career development.</p></div>
                  </div>
                   <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0"></div>
                    <div><h4 className="font-medium">Great Benefits</h4><p className="text-sm text-gray-600">Health, dental, vision, and wellness programs.</p></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Application Process</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{step:1, title:"Submit Application", desc:"Complete the form and upload your resume."}, {step:2, title:"Initial Review", desc:"Our team reviews your application (2-3 days)."}, {step:3, title:"Interview Process", desc:"Phone/video interviews with our team."}, {step:4, title:"Final Decision", desc:"Offer and onboarding process."}].map(item => (
                  <div key={item.step} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><span className="text-blue-600 font-bold text-sm">{item.step}</span></div>
                    <div><h4 className="font-medium">{item.title}</h4><p className="text-sm text-gray-600">{item.desc}</p></div>
                  </div>))}
                </div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Questions?</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4">Have questions about the position or application process? We're here to help!</p>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-gray-400" /><span>careers@talenthub.com</span></div>
                        <div className="flex items-center space-x-2"><Building2 className="h-4 w-4 text-gray-400" /><span>San Francisco, CA</span></div>
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Talent Hub. All rights reserved.</p>
          <p className="mt-1">By submitting this application, you agree to our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.</p>
        </div>
      </footer>
    </div>
  );
}