"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  MoreHorizontal,
  Loader2,
  Users, // Placeholder for an empty state icon
  Briefcase,
} from "lucide-react";
import Link from "next/link"; // Import Link
import {
  getFirestore,
  collection,
  getDocs,
  query,
  Timestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

interface Candidate {
  id: string; // Firestore document ID
  fullName: string;
  email: string;
  image?: string; // URL to candidate's profile image
  phone?: string;
  departmentApplied: string;
  experienceLevelApplied: string;
  jobIdApplied: string;
  linkedIn?: string;
  portfolio?: string;
  resumeUrl: string;
  originalFileName?: string;
  submittedAt: Timestamp;
  status: string; // e.g., "Received", "Screening"
  // Fields that were in static data but need to be handled:
  // positionTitle?: string; // Would need to be fetched or denormalized
  // location?: string; // Candidate's location, if collected during application
  // skills?: string[]; // If collected
  // rating?: number; // If assigned by admin
}

// Re-use static labels if you have them consistently defined
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

const staticExperienceLevelLabels: { [key: string]: string } = {
    "entry": "Entry Level (0-2 years)",
    "mid": "Mid Level (3-5 years)",
    "senior": "Senior Level (6-10 years)",
    "lead": "Lead/Principal (10+ years)",
    "executive": "Executive",
};


export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobFilter, setSelectedJobFilter] = useState("all"); // Filter by departmentApplied or jobIdApplied
  const [selectedStage, setSelectedStage] = useState("all");

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      const fetchedCandidates: Candidate[] = [];
      try {
        const candidateCategoriesRef = collection(db, "candidateCategories");
        const departmentSnapshot = await getDocs(candidateCategoriesRef);

        for (const deptDoc of departmentSnapshot.docs) {
          const departmentId = deptDoc.id; // This is departmentApplied
          const candidatesCollectionRef = collection(
            db,
            "candidateCategories",
            departmentId,
            "candidates"
          );
          const candidatesQuery = query(candidatesCollectionRef);
          const candidatesSnapshot = await getDocs(candidatesQuery);

          candidatesSnapshot.forEach((candidateDoc) => {
            const candidateData = candidateDoc.data();
            fetchedCandidates.push({
              id: candidateDoc.id,
              // departmentApplied is already part of candidateData if saved correctly
              ...candidateData,
            } as Candidate);
          });
        }
        // Sort candidates by submission date, newest first
        fetchedCandidates.sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
        setCandidates(fetchedCandidates);
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Failed to load candidates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) { // Added optional chaining and toLowerCase for robustness
      case "received":
        return "bg-blue-100 text-blue-800"; // Changed "Applied" to "Received"
      case "screening":
        return "bg-cyan-100 text-cyan-800";
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Star rendering can be kept if you plan to add a rating system later
  const renderStars = (rating?: number) => {
    if (typeof rating !== 'number') return null; // Don't render if no rating
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  // Memoized and filtered candidates for display
  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const nameMatch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
      // For "Position" filter, we can filter by departmentApplied or jobIdApplied
      const jobMatch = selectedJobFilter === "all" ||
                       candidate.departmentApplied === selectedJobFilter ||
                       candidate.jobIdApplied === selectedJobFilter;
      const stageMatch = selectedStage === "all" || candidate.status.toLowerCase() === selectedStage.toLowerCase();
      return (nameMatch || emailMatch) && jobMatch && stageMatch;
    });
  }, [candidates, searchTerm, selectedJobFilter, selectedStage]);

  // For populating the "Position/Department" filter dropdown
  const availableJobsForFilter = useMemo(() => {
    const jobIdentifiers = new Map<string, string>(); // value -> label
    candidates.forEach(c => {
        // Using departmentApplied for a broader category, or jobIdApplied for specific jobs
        const label = staticDepartmentLabels[c.departmentApplied] || c.departmentApplied;
        if(!jobIdentifiers.has(c.departmentApplied)){
            jobIdentifiers.set(c.departmentApplied, `Dept: ${label}`);
        }
        // If you want to filter by specific Job IDs as well:
        // if(!jobIdentifiers.has(c.jobIdApplied)){
        //     jobIdentifiers.set(c.jobIdApplied, `Job ID: ${c.jobIdApplied.substring(0,6)}... (${label})`);
        // }
    });
    return Array.from(jobIdentifiers, ([value, label]) => ({ value, label }));
  }, [candidates]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            Manage and review candidate applications
          </p>
        </div>
        {/* <div className="flex items-center space-x-2">
          <Button variant="outline">Export</Button>
          <Button>Import Candidates</Button>
        </div> */}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Applied For (Department/Job)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applied For</SelectItem>
                {availableJobsForFilter.map(jobFilter => (
                    <SelectItem key={jobFilter.value} value={jobFilter.value}>{jobFilter.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button> */}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           <p className="ml-2 text-muted-foreground">Loading candidates...</p>
        </div>
      )}
      {error && (
        <Card className="bg-red-50 border-red-200"><CardContent className="pt-6 text-red-700 text-center"><p>{error}</p></CardContent></Card>
      )}
      {!isLoading && !error && filteredCandidates.length === 0 && (
        <Card><CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No candidates found.</p>
            <p className="text-sm">{candidates.length > 0 ? "Try adjusting your filters." : "No candidates have applied yet."}</p>
        </CardContent></Card>
      )}

      {!isLoading && !error && filteredCandidates.length > 0 && (
        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-10 w-10">
                  {candidate.image ? (
                    <AvatarImage src={candidate.image} alt={candidate.fullName} />
                  ) : (
                    <AvatarFallback className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {candidate.fullName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "N/A"}
                      </span>
                    </AvatarFallback>
                  )}
                </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/admin/candidates/${candidate.departmentApplied}/${candidate.id}`} className="hover:underline">
                          <h3 className="text-lg font-semibold">{candidate.fullName}</h3>
                        </Link>
                        {/* For position, show department applied or job ID. Fetching job title is an enhancement */}
                        <p className="text-sm text-muted-foreground">
                          Applied for: {staticDepartmentLabels[candidate.departmentApplied] || candidate.departmentApplied}
                          {/* (Job ID: {candidate.jobIdApplied.substring(0,8)}...) */}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStageColor(candidate.status)} capitalize`}>
                          {candidate.status}
                        </Badge>
                        {/* <Button variant="ghost" size="icon" className="h-8 w-8"> <MoreHorizontal className="h-4 w-4" /> </Button> */}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {candidate.email && <div className="flex items-center space-x-1"><Mail className="h-4 w-4" /><span>{candidate.email}</span></div>}
                      {candidate.phone && <div className="flex items-center space-x-1"><Phone className="h-4 w-4" /><span>{candidate.phone}</span></div>}
                      {/* Candidate location is not directly available from current form submission */}
                      {/* <div className="flex items-center space-x-1"><MapPin className="h-4 w-4" /><span>{candidate.location || "N/A"}</span></div> */}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Applied{" "}
                          {candidate.submittedAt instanceof Timestamp
                            ? candidate.submittedAt.toDate().toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rating - not available from Firestore yet */}
                        {/* <div className="flex items-center space-x-1">{renderStars(candidate.rating)}<span className="text-sm text-muted-foreground ml-1">{candidate.rating}</span></div> */}
                        <span className="text-sm text-muted-foreground">
                          Experience: {staticExperienceLevelLabels[candidate.experienceLevelApplied] || candidate.experienceLevelApplied || "N/A"}
                        </span>
                        {candidate.resumeUrl && (
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a>
                        </Button>
                     )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/admin/candidates/${candidate.departmentApplied}/${candidate.id}`}>View Profile</Link>
                        </Button>
                        {/* <Button size="sm">Schedule Interview</Button> */}
                      </div>
                    </div>

                    {/* Skills - not available from Firestore data yet */}
                    {/* {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {candidate.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )} */}
                     
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}