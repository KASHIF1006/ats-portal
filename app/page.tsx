"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  Calendar, // Kept for future "Upcoming Interviews"
  TrendingUp,
  Eye,
  Loader2, // For loading states
  AlertTriangle, // For errors
} from "lucide-react";
import Link from "next/link";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  getCountFromServer, // For more efficient counts if available and preferred
} from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

interface DashboardJob {
  id: string;
  title: string;
  department: string; // departmentId
  company?: string;
  status?: string;
}

interface RecentApplication {
  id: string;
  fullName: string;
  jobIdApplied: string;
  departmentApplied: string; // departmentId
  status: string;
  submittedAt: Timestamp;
  // For displaying job title, an extra fetch or denormalization would be needed
  // jobTitle?: string;
}

// Consistent with other pages
const staticDepartmentLabels: { [key: string]: string } = {
    "frontend": "Frontend", "backend": "Backend", "software-engineer": "Software Engineer",
    "devops": "DevOps", "sales": "Sales", "finance": "Finance",
    "product": "Product Management", "engineering": "Engineering", "design": "Design",
    "marketing": "Marketing", "hr": "Human Resources", "operations": "Operations",
};


export default function Dashboard() {
  const [totalApplications, setTotalApplications] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [activeJobsForDisplay, setActiveJobsForDisplay] = useState<DashboardJob[]>([]);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingActiveJobs, setIsLoadingActiveJobs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hire Rate is complex, keep static or as placeholder for now
  const hireRateStat = { title: "Hire Rate", value: "15%", change: "+1%", icon: TrendingUp, color: "text-orange-600" };


  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingStats(true);
      setIsLoadingRecent(true);
      setIsLoadingActiveJobs(true);
      setError(null);

      try {
        // --- Fetch Total Applications & Recent Applications ---
        let appCount = 0;
        const allApplications: RecentApplication[] = [];
        const candidateCategoriesRef = collection(db, "candidateCategories");
        const deptSnapshots = await getDocs(candidateCategoriesRef);

        for (const deptDoc of deptSnapshots.docs) {
          const candidatesColRef = collection(db, "candidateCategories", deptDoc.id, "candidates");
          // For total count (less efficient way if not using getCountFromServer)
          const candidatesSnap = await getDocs(candidatesColRef);
          appCount += candidatesSnap.size;
          
          // For recent applications (fetch all then sort, or query with limit per dept then merge-sort)
          candidatesSnap.forEach(candidateDoc => {
            const data = candidateDoc.data();
            allApplications.push({
              id: candidateDoc.id,
              fullName: data.fullName,
              jobIdApplied: data.jobIdApplied,
              departmentApplied: deptDoc.id, // or data.departmentApplied if stored directly
              status: data.status,
              submittedAt: data.submittedAt as Timestamp,
            });
          });
        }
        setTotalApplications(appCount);
        allApplications.sort((a,b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
        setRecentApplications(allApplications.slice(0, 4)); // Get top 4 recent
        setIsLoadingRecent(false);


        // --- Fetch Active Jobs Count & List for Display ---
        let activeJobC = 0;
        const activeJobsList: DashboardJob[] = [];
        const jobCategoriesRef = collection(db, "jobCategories");
        const jobDeptSnapshots = await getDocs(jobCategoriesRef);

        for (const deptDoc of jobDeptSnapshots.docs) {
          const jobsColRef = collection(db, "jobCategories", deptDoc.id, "jobs");
          const q = query(jobsColRef, where("status", "==", "published"));
          const activeJobsSnap = await getDocs(q);
          activeJobC += activeJobsSnap.size;

          activeJobsSnap.forEach(jobDoc => {
            if (activeJobsList.length < 4) { // Display up to 4 active jobs
                const data = jobDoc.data();
                activeJobsList.push({
                    id: jobDoc.id,
                    title: data.title,
                    department: deptDoc.id,
                    company: data.company,
                    status: data.status,
                });
            }
          });
        }
        setActiveJobsCount(activeJobC);
        // Sort by whatever criteria if needed, e.g., title, or just take as fetched
        activeJobsList.sort((a, b) => a.title.localeCompare(b.title));
        setActiveJobsForDisplay(activeJobsList);
        setIsLoadingActiveJobs(false);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please refresh.");
      } finally {
        setIsLoadingStats(false); // Combined loading for stats
        // Individual loading states already handled above
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: "Total Applications",
      value: isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : totalApplications.toLocaleString(),
      change: "", // Change percentage would require historical data
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Jobs",
      value: isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : activeJobsCount.toLocaleString(),
      change: "", // Change would require historical data
      icon: Briefcase,
      color: "text-green-600",
    },
    hireRateStat, // Static for now
  ];

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your recruitment.</p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-red-700 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest candidates who applied</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
              <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent applications.</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                      {app.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "N/A"}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm font-medium leading-none">{app.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied for {staticDepartmentLabels[app.departmentApplied] || app.departmentApplied}
                        {/* TODO: Fetch job title based on app.jobIdApplied for better UX */}
                      </p>
                       <p className="text-xs text-muted-foreground">
                        On: {app.submittedAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getStageColor(app.status)} capitalize text-xs`}>{app.status}</Badge>
                       <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/candidates/${app.departmentApplied}/${app.id}?jobId=${app.jobIdApplied}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/candidates">View All Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Job Postings</CardTitle>
            <CardDescription>A few of your current live jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingActiveJobs ? (
                <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : activeJobsForDisplay.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active jobs posted.</p>
            ) : (
              <div className="space-y-4">
                {activeJobsForDisplay.map((job) => (
                  <div key={job.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <Link href={`/jobs/${job.department}/${job.id}/application`} className="hover:underline">
                        <p className="text-sm font-medium leading-none">{job.title}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {staticDepartmentLabels[job.department] || job.department} {job.company ? `at ${job.company}`: ""}
                      </p>
                    </div>
                     <Badge variant="outline" className="text-xs">
                        {/* Placeholder for app count or view button */}
                        View
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/jobs">View All Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you manage your recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Button className="h-20 flex-col space-y-1 py-2" asChild>
              <Link href="/jobs/new">
                <Briefcase className="h-5 w-5 mb-1" />
                <span>Post New Job</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-1 py-2" asChild>
              <Link href="/candidates">
                <Users className="h-5 w-5 mb-1" />
                <span>Review Candidates</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-1 py-2" disabled> {/* Placeholder */}
                <Calendar className="h-5 w-5 mb-1" />
                <span>Schedule Interviews</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}