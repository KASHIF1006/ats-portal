"use client";

import { useEffect, useState, useMemo } from "react"; // Added useEffect, useState, useMemo
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
import {
  MapPin,
  Clock,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Loader2, // For loading state
  Briefcase, // For empty state
} from "lucide-react";
import Link from "next/link";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  Timestamp, // Import Timestamp
} from "firebase/firestore";
import { app } from "@/lib/firebase"; // Your Firebase app instance

const db = getFirestore(app);

// Define an interface for your job data from Firestore
interface Job {
  id: string; // Firestore document ID
  title: string;
  company: string;
  department: string; // This will be the parent doc ID (e.g., "engineering")
  location: string;
  jobType: string;
  workArrangement?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  experienceLevel?: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  applicationDeadline?: string | Timestamp; // Can be string from input or Timestamp
  isUrgent?: boolean;
  requiresCoverLetter?: boolean;
  requiresPortfolio?: boolean;
  skills?: string[];
  benefits?: string[];
  status: string; // e.g., "published", "draft", "closed"
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp;
  // applications: number; // This field is complex to get dynamically here, omitting for now
}

// Define your static labels here for consistency
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


export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for filters - functionality to be implemented later
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      setError(null);
      const fetchedJobs: Job[] = [];
      try {
        const jobCategoriesCollectionRef = collection(db, "jobCategories");
        const departmentSnapshot = await getDocs(jobCategoriesCollectionRef);

        for (const deptDoc of departmentSnapshot.docs) {
          const departmentId = deptDoc.id;
          const jobsCollectionRef = collection(
            db,
            "jobCategories",
            departmentId,
            "jobs"
          );
          const jobsQuery = query(jobsCollectionRef); // Fetch all jobs regardless of status initially
          const jobsSnapshot = await getDocs(jobsQuery);

          jobsSnapshot.forEach((jobDoc) => {
            const jobData = jobDoc.data();
            fetchedJobs.push({
              id: jobDoc.id,
              department: departmentId, // Store the department ID from the parent collection
              ...jobData,
            } as Job); // Assert type after spreading
          });
        }
        // Sort jobs by creation date, newest first
        fetchedJobs.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "published": // Assuming "Active" jobs are "published" in Firestore
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800"; // Changed for more distinction
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatSalary = (job: Job) => {
    if (job.salaryMin && job.salaryMax) {
      return `${job.salaryCurrency || "$"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) {
      return `${job.salaryCurrency || "$"} ${job.salaryMin.toLocaleString()} (min)`;
    }
    if (job.salaryMax) {
      return `${job.salaryCurrency || "$"} ${job.salaryMax.toLocaleString()} (max)`;
    }
    return "Not Disclosed";
  };

  // Memoized and filtered jobs for display
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const departmentMatch = selectedDepartment === "all" || job.department === selectedDepartment;
      const statusMatch = selectedStatus === "all" || job.status.toLowerCase() === selectedStatus.toLowerCase();
      return titleMatch && departmentMatch && statusMatch;
    });
  }, [jobs, searchTerm, selectedDepartment, selectedStatus]);

  const availableDepartmentsForFilter = useMemo(() => {
    const depts = new Set(jobs.map(job => job.department));
    return Array.from(depts).map(dept => ({
        value: dept,
        label: staticDepartmentLabels[dept] || dept.charAt(0).toUpperCase() + dept.slice(1)
    }));
  }, [jobs]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your job postings and track applications
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new"> {/* Assuming admin path for new job */}
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs by title..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {availableDepartmentsForFilter.map(dept => (
                    <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published (Active)</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
          <p className="ml-2 text-muted-foreground">Loading jobs...</p>
        </div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-red-700 text-center">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredJobs.length === 0 && (
         <Card>
          <CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No jobs found.</p>
            <p className="text-sm">
                {jobs.length > 0 ? "Try adjusting your filters or search term." : "Post a new job to get started!"}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && filteredJobs.length > 0 && (
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/jobs/${job.department}/${job.id}`} className="hover:underline">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                      </Link>
                      <Badge className={`${getStatusColor(job.status)} capitalize`}>
                        {job.status}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {staticDepartmentLabels[job.department] || job.department} at {job.company}
                    </CardDescription>
                  </div>
                  {/* Placeholder for actions dropdown */}
                  {/* <Button variant="ghost" size="icon"> <MoreHorizontal className="h-5 w-5" /> </Button> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatSalary(job)}</span>
                    </div>
                    {/* <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{0} applications</span> // Placeholder for applications count
                    </div> */}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-dashed mt-3">
                    <span className="text-xs text-muted-foreground">
                      Posted on{" "}
                      {job.createdAt instanceof Timestamp
                        ? job.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/jobs/${job.department}/${job.id}/applications`}>
                          View Applications
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/admin/jobs/${job.department}/${job.id}/edit`}>Edit Job</Link>
                      </Button>
                    </div>
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