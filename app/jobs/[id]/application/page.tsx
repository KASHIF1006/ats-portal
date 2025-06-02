"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  Sparkles,
  Eye,
  Download,
  Loader2,
  Users,
  FileText,
  DollarSign,
  Link as LinkIcon,
  Mail,
  Phone,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore"
import { app } from "@/lib/firebase"

const db = getFirestore(app);

interface JobDetails {
  id: string;
  title: string;
  company?: string;
  department: string;
  location: string;
  jobType: string;
  workArrangement?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  experienceLevel?: string;
  description: string;
  requirements?: string[] | string;
  responsibilities?: string;
  skills?: string[];
  benefits?: string[];
  status: string;
  createdAt: Timestamp;
}

interface CandidateApplication {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentApplied: string;
  experienceLevelApplied: string;
  jobIdApplied: string;
  linkedIn?: string;
  portfolio?: string;
  resumeUrl: string;
  originalFileName?: string;
  submittedAt: Timestamp;
  status: string;
}

interface AiMatchedCandidateInfo {
  candidate_id: string;
  departmentApplied: string;
  email: string;
  experienceLevelApplied: string;
  linkedIn?: string;
  matched_keywords: string[];
  name: string;
  phone?: string;
  portfolio?: string;
  resume_url: string;
  score_out_of_100: number;
  submittedAt: string; // Date string from API
  status?: string; // Status from Firestore or AI
}

interface AiApiResponse {
  all_matched_list: AiMatchedCandidateInfo[];
  best_candidates: number;
  better_candidates: number;
  good_candidates: number;
  total_candidates_analyzed: number;
}

interface DisplayCandidate extends CandidateApplication {
  matchScore?: number;
  matchedKeywords?: string[];
}


const staticDepartmentLabels: { [key: string]: string } = {
    "frontend": "Frontend", "backend": "Backend", "software-engineer": "Software Engineer",
    "devops": "DevOps", "sales": "Sales", "finance": "Finance",
    "product": "Product Management", "engineering": "Engineering", "design": "Design",
    "marketing": "Marketing", "hr": "Human Resources", "operations": "Operations",
};
const staticExperienceLevelLabels: { [key: string]: string } = {
    "entry": "Entry Level (0-2 years)", "mid": "Mid Level (3-5 years)",
    "senior": "Senior Level (6-10 years)", "lead": "Lead/Principal (10+ years)", "executive": "Executive",
};

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();

  const jobIdFromUrl = params.id as string;

  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isLoadingAiMatches, setIsLoadingAiMatches] = useState(false);

  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [actualDepartmentId, setActualDepartmentId] = useState<string | null>(null);
  
  const [allApplicants, setAllApplicants] = useState<CandidateApplication[]>([]);
  const [displayCandidates, setDisplayCandidates] = useState<DisplayCandidate[]>([]);
  
  const [aiSummary, setAiSummary] = useState<Omit<AiApiResponse, "all_matched_list"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState("matchScore"); // Default to matchScore

  useEffect(() => {
    if (!jobIdFromUrl) {
      setError("Job ID is missing from URL.");
      setIsLoadingJob(false);
      setIsLoadingCandidates(false);
      return;
    }

    const loadInitialData = async () => {
      setIsLoadingJob(true);
      setIsLoadingCandidates(true);
      setError(null);
      setAiError(null);
      let foundJob: JobDetails | null = null;
      let foundDeptId: string | null = null;

      try {
        const jobCategoriesCollectionRef = collection(db, "jobCategories");
        const departmentSnapshot = await getDocs(jobCategoriesCollectionRef);

        for (const deptDoc of departmentSnapshot.docs) {
          const departmentIdLoop = deptDoc.id;
          const jobDocRef = doc(db, "jobCategories", departmentIdLoop, "jobs", jobIdFromUrl);
          const jobDocSnap = await getDoc(jobDocRef);

          if (jobDocSnap.exists()) {
            foundJob = { id: jobDocSnap.id, department: departmentIdLoop, ...jobDocSnap.data() } as JobDetails;
            foundDeptId = departmentIdLoop;
            setJobDetails(foundJob);
            setActualDepartmentId(foundDeptId);
            break;
          }
        }

        if (!foundJob || !foundDeptId) {
          setError("Job not found.");
          setIsLoadingJob(false);
          setIsLoadingCandidates(false);
          return;
        }
        setIsLoadingJob(false);

        const candidatesCollectionRef = collection(db, "candidateCategories", foundDeptId, "candidates");
        const q = query(candidatesCollectionRef, where("jobIdApplied", "==", jobIdFromUrl));
        const candidatesSnapshot = await getDocs(q);
        const fetchedApplicants: CandidateApplication[] = [];
        candidatesSnapshot.forEach((docSnap) => {
          fetchedApplicants.push({ id: docSnap.id, ...docSnap.data() } as CandidateApplication);
        });
        setAllApplicants(fetchedApplicants);
        setIsLoadingCandidates(false);

      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load job or initial candidate data.");
        setIsLoadingJob(false);
        setIsLoadingCandidates(false);
      }
    };

    loadInitialData();
  }, [jobIdFromUrl]);


  useEffect(() => {
    if (!actualDepartmentId || !jobIdFromUrl || !jobDetails) {
      return;
    }

    const fetchAiMatches = async () => {
      setIsLoadingAiMatches(true);
      setAiError(null);
      try {
        const aiApiBody = {
          category: actualDepartmentId,
          jobId: jobIdFromUrl,
          top_n: allApplicants.length > 0 ? allApplicants.length : 5, // Analyze all applicants or a default
        };
        const aiResponse = await fetch('http://127.0.0.1:5000/match_resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiApiBody),
        });

        if (!aiResponse.ok) {
          const aiErrorData = await aiResponse.json();
          throw new Error(aiErrorData.message || aiErrorData.error || `AI API request failed: ${aiResponse.status}`);
        }
        const aiData: AiApiResponse = await aiResponse.json();

        const mergedCandidates = aiData.all_matched_list.map((aiCand): DisplayCandidate => {
          const originalApplicant = allApplicants.find(app => app.id === aiCand.candidate_id);
          return {
            id: aiCand.candidate_id,
            fullName: aiCand.name,
            email: aiCand.email,
            phone: originalApplicant?.phone || aiCand.phone,
            departmentApplied: aiCand.departmentApplied,
            experienceLevelApplied: aiCand.experienceLevelApplied,
            jobIdApplied: jobIdFromUrl,
            linkedIn: originalApplicant?.linkedIn || aiCand.linkedIn,
            portfolio: originalApplicant?.portfolio || aiCand.portfolio,
            resumeUrl: aiCand.resume_url,
            originalFileName: originalApplicant?.originalFileName,
            submittedAt: originalApplicant?.submittedAt || new Timestamp(Math.floor(new Date(aiCand.submittedAt).getTime() / 1000), 0),
            status: originalApplicant?.status || aiCand.status || "N/A",
            matchScore: aiCand.score_out_of_100,
            matchedKeywords: aiCand.matched_keywords || [],
          };
        });
        
        mergedCandidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setDisplayCandidates(mergedCandidates);
        setAiSummary({
            best_candidates: aiData.best_candidates,
            better_candidates: aiData.better_candidates,
            good_candidates: aiData.good_candidates,
            total_candidates_analyzed: aiData.total_candidates_analyzed,
        });

      } catch (aiErr) {
        console.error("Error calling AI matching API:", aiErr);
        setAiError(aiErr instanceof Error ? aiErr.message : "Failed to get AI matches.");
        setDisplayCandidates([]); 
      } finally {
        setIsLoadingAiMatches(false);
      }
    };

    if(allApplicants.length > 0 || !isLoadingCandidates){ // Call AI if applicants loaded or if there were none (API might still return general info)
        fetchAiMatches();
    }

  }, [actualDepartmentId, jobIdFromUrl, jobDetails, allApplicants, isLoadingCandidates]);


  const handleSort = (order: string) => {
    setSortOrder(order);
    const sortedCandidates = [...displayCandidates];
    switch (order) {
      case "matchScore":
        sortedCandidates.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case "recent":
        sortedCandidates.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
        break;
      case "name":
        sortedCandidates.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
    }
    setDisplayCandidates(sortedCandidates);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "received": return "bg-blue-100 text-blue-800";
      case "screening": return "bg-cyan-100 text-cyan-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      case "interview": return "bg-purple-100 text-purple-800";
      case "offer": return "bg-green-100 text-green-800";
      case "hired": return "bg-teal-100 text-teal-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getMatchScoreColor = (score?: number) => {
    if (score === undefined) return "bg-gray-500";
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-blue-600";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };


  const formatSalary = (job: JobDetails | null) => {
    if (!job) return "N/A";
    if (job.salaryMin && job.salaryMax) return `${job.salaryCurrency || "$"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `${job.salaryCurrency || "$"} ${job.salaryMin.toLocaleString()} (min)`;
    if (job.salaryMax) return `${job.salaryCurrency || "$"} ${job.salaryMax.toLocaleString()} (max)`;
    return "Not Disclosed";
  };

  if (isLoadingJob) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
        <div className="space-y-6 text-center py-10">
         <Button variant="ghost" size="sm" onClick={() => router.push("/admin/jobs")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs List
          </Button>
          <Card className="max-w-md mx-auto">
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p className="text-red-600">{error || "Job details could not be loaded."}</p></CardContent>
          </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs List
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-center flex-1 truncate">
          Applications for: <span className="text-blue-600">{jobDetails.title}</span>
        </h1>
        <Badge variant="outline" className="text-base">
          {allApplicants.length} Total Application{allApplicants.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl">{jobDetails.title}</CardTitle>
              <CardDescription className="text-sm">
                {staticDepartmentLabels[jobDetails.department] || jobDetails.department} • {jobDetails.location}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline">{jobDetails.jobType}</Badge>
              <Badge variant="secondary">{formatSalary(jobDetails)}</Badge>
            </div>
          </div>
        </CardHeader>
        { (jobDetails.description || jobDetails.requirements || jobDetails.skills) &&
            <CardContent className="border-t pt-4">
            {jobDetails.description && (
                <div className="mb-4">
                <h3 className="font-medium mb-1 text-sm">Job Description</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">{jobDetails.description}</p>
                </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
                {jobDetails.requirements && (
                <div>
                    <h3 className="font-medium mb-1 text-sm">Key Requirements</h3>
                    {typeof jobDetails.requirements === 'string' ? (
                        <p className="text-xs text-muted-foreground">{jobDetails.requirements}</p>
                    ) : (
                        <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                        {jobDetails.requirements.slice(0,3).map((req, i) => (<li key={i}>{req}</li>))}
                        {jobDetails.requirements.length > 3 && <li>...and more</li>}
                        </ul>
                    )}
                </div>
                )}
                {jobDetails.skills && jobDetails.skills.length > 0 && (
                <div>
                    <h3 className="font-medium mb-1 text-sm">Required Skills</h3>
                    <div className="flex flex-wrap gap-1">
                    {jobDetails.skills.map((skill, i) => (<Badge key={i} variant="outline" className="text-xs">{skill}</Badge>))}
                    </div>
                </div>
                )}
            </div>
            </CardContent>
        }
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-base">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI Matching Overview</span>
          </CardTitle>
          <CardDescription className="text-xs">
            AI-powered analysis of candidates for this position.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAiMatches && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /> <span className="ml-2 text-sm">Analyzing candidates...</span></div>}
          {aiError && <p className="text-red-500 text-sm text-center py-4">{aiError}</p>}
          {!isLoadingAiMatches && !aiError && aiSummary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-0.5">{aiSummary.total_candidates_analyzed}</div>
                  <p className="text-xs text-gray-600">Analyzed</p>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                  <div className="text-2xl font-bold text-green-600 mb-0.5">{aiSummary.best_candidates}</div>
                  <p className="text-xs text-gray-600">Strong Matches</p>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                  <div className="text-2xl font-bold text-sky-600 mb-0.5">{aiSummary.better_candidates}</div>
                  <p className="text-xs text-gray-600">Better Matches</p>
              </div>
              <div className="bg-white rounded-lg p-3 border text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-0.5">{aiSummary.good_candidates}</div>
                  <p className="text-xs text-gray-600">Good Matches</p>
              </div>
            </div>
          )}
           {!isLoadingAiMatches && !aiError && !aiSummary && allApplicants.length > 0 &&
                <p className="text-sm text-muted-foreground text-center py-4">AI matching results will appear here.</p>
           }
           {!isLoadingAiMatches && !aiError && !aiSummary && allApplicants.length === 0 && !isLoadingCandidates &&
                <p className="text-sm text-muted-foreground text-center py-4">No applicants to analyze.</p>
           }
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Matched Candidate Applications</CardTitle>
            <Select value={sortOrder} onValueChange={handleSort} disabled={displayCandidates.length === 0}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="matchScore">Sort by Match Score</SelectItem>
                <SelectItem value="recent">Sort by Most Recent</SelectItem>
                <SelectItem value="name">Sort by Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingAiMatches && <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>}
          {!isLoadingAiMatches && aiError && <p className="text-red-500 text-center py-6">{aiError}</p>}
          {!isLoadingAiMatches && !aiError && displayCandidates.length === 0 && (
            <p className="text-center text-muted-foreground py-6">
                {allApplicants.length > 0 ? "No candidates matched by AI or an error occurred." : "No candidates have applied for this job yet."}
            </p>
          )}
          {!isLoadingAiMatches && !aiError && displayCandidates.length > 0 && (
            <div className="space-y-4">
              {displayCandidates.map((candidate) => (
                <Card key={candidate.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-shrink-0 w-full sm:w-20 text-center">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto ${getMatchScoreColor(candidate.matchScore)}`}>
                            <span className="text-white font-bold text-xl sm:text-2xl">{Math.round(candidate.matchScore || 0)}%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Match Score</p>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                          <div>
                            <Link href={`/candidates/${candidate.departmentApplied}/${candidate.id}?jobId=${jobIdFromUrl}`} className="hover:underline">
                               <h3 className="font-semibold text-md">{candidate.fullName}</h3>
                            </Link>
                            <p className="text-xs text-muted-foreground">{candidate.email}</p>
                            {candidate.phone && <p className="text-xs text-muted-foreground flex items-center mt-0.5"><Phone className="h-3 w-3 mr-1.5"/>{candidate.phone}</p>}
                          </div>
                          <Badge className={`${getStatusColor(candidate.status)} capitalize text-xs h-fit mt-1 sm:mt-0`}>
                            {candidate.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>Exp: {staticExperienceLevelLabels[candidate.experienceLevelApplied] || candidate.experienceLevelApplied || "N/A"}</span>
                          </div>
                           <div className="flex items-center space-x-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Applied: {candidate.submittedAt instanceof Timestamp ? candidate.submittedAt.toDate().toLocaleDateString() : new Date(candidate.submittedAt as any).toLocaleDateString()}</span>
                          </div>
                          {candidate.linkedIn && (
                            <div className="flex items-center space-x-1.5 truncate col-span-full sm:col-span-1">
                                <LinkIcon className="h-3.5 w-3.5"/>
                                <a href={candidate.linkedIn.startsWith('http') ? candidate.linkedIn : `https://${candidate.linkedIn}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate">
                                    LinkedIn
                                </a>
                            </div>
                          )}
                           {candidate.portfolio && (
                            <div className="flex items-center space-x-1.5 truncate col-span-full sm:col-span-1">
                                <LinkIcon className="h-3.5 w-3.5"/>
                                <a href={candidate.portfolio.startsWith('http') ? candidate.portfolio : `https://${candidate.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 truncate">
                                    Portfolio
                                </a>
                            </div>
                          )}
                        </div>
                        
                        {candidate.matchedKeywords && candidate.matchedKeywords.length > 0 && jobDetails?.skills && (
                             <div className="mt-2 pt-2 border-t border-dashed">
                                <p className="text-xs font-medium mb-1">Matched Skills/Keywords:</p>
                                <div className="flex flex-wrap gap-1">
                                    {candidate.matchedKeywords.map((keyword, idx) => {
                                        const isRequiredByJob = jobDetails.skills?.includes(keyword);
                                        return (
                                            <Badge key={idx} variant={isRequiredByJob ? "default" : "secondary"} className={`text-xs ${isRequiredByJob ? "bg-blue-100 text-blue-700" : ""}`}>
                                                {keyword}
                                                {isRequiredByJob && <CheckCircle2 className="h-3 w-3 ml-1 text-blue-700"/>}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        <div className="flex items-center justify-start sm:justify-end gap-2 mt-3 pt-3 border-t border-dashed">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/candidates/${candidate.departmentApplied}/${candidate.id}?jobId=${jobIdFromUrl}`}>
                                <Eye className="h-3.5 w-3.5 mr-1.5" /> View Profile
                            </Link>
                          </Button>
                          {candidate.resumeUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3.5 w-3.5 mr-1.5" /> Resume
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}