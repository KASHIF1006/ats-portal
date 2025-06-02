"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Loader2,
  Briefcase,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

interface ScheduledInterview {
  id: string;
  candidateName: string;
  candidateId: string;
  candidateEmail?: string;
  jobTitle: string;
  jobId: string;
  departmentId: string;
  interviewer: string;
  interviewTimestamp: Timestamp;
  interviewDate: string;
  interviewTime: string;
  duration: string;
  interviewType: string;
  interviewFormat: string;
  locationOrLink: string;
  notes?: string;
  status: string;
  createdAt: Timestamp;
}

const staticDepartmentLabels: { [key: string]: string } = {
    "frontend": "Frontend", "backend": "Backend", "software-engineer": "Software Engineer",
    "devops": "DevOps", "sales": "Sales", "finance": "Finance",
    "product": "Product Management", "engineering": "Engineering", "design": "Design",
    "marketing": "Marketing", "hr": "Human Resources", "operations": "Operations",
};

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<ScheduledInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const interviewsColRef = collection(db, "interviewCollections");
        const q = query(interviewsColRef, orderBy("interviewTimestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedInterviews: ScheduledInterview[] = [];
        querySnapshot.forEach((doc) => {
          fetchedInterviews.push({ id: doc.id, ...doc.data() } as ScheduledInterview);
        });
        setInterviews(fetchedInterviews);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "rescheduled": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "technical": return "bg-purple-100 text-purple-800";
      case "behavioral": return "bg-orange-100 text-orange-800";
      case "hr round": return "bg-pink-100 text-pink-800";
      case "final": return "bg-teal-100 text-teal-800";
      case "portfolio review": return "bg-indigo-100 text-indigo-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatDateForDisplay = (timestamp: Timestamp | undefined, dateStr: string) => {
    if (!timestamp && !dateStr) return "N/A";
    const dateObj = timestamp ? timestamp.toDate() : new Date(dateStr);
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (dateObj.toDateString() === today.toDateString()) return "Today";
    if (dateObj.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = interview.candidateName.toLowerCase().includes(searchTermLower);
        const positionMatch = interview.jobTitle.toLowerCase().includes(searchTermLower);
        const interviewerMatch = interview.interviewer.toLowerCase().includes(searchTermLower);

        const statusMatch = selectedStatusFilter === "all" || interview.status.toLowerCase() === selectedStatusFilter.toLowerCase();
        const typeMatch = selectedTypeFilter === "all" || interview.interviewType.toLowerCase() === selectedTypeFilter.toLowerCase();
        
        return (nameMatch || positionMatch || interviewerMatch) && statusMatch && typeMatch;
    });
  }, [interviews, searchTerm, selectedStatusFilter, selectedTypeFilter]);

  const interviewsTodayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return interviews.filter(iv => iv.interviewDate === todayStr && iv.status === "Scheduled").length;
  }, [interviews]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
         <p className="ml-3 text-muted-foreground">Loading interviews...</p>
      </div>
    );
  }
  if (error) {
     return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Manage and schedule candidate interviews</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewsTodayCount}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.filter(iv => iv.status === "Scheduled").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.filter(iv => iv.status === "Completed").length}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~50m</div>
            <p className="text-xs text-muted-foreground">Placeholder</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search candidate, position..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"> <SelectValue placeholder="Status" /> </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Rescheduled">Rescheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"> <SelectValue placeholder="Type" /> </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Behavioral">Behavioral</SelectItem>
                <SelectItem value="HR Round">HR Round</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Portfolio Review">Portfolio Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {filteredInterviews.length === 0 && !isLoading && (
         <Card><CardContent className="pt-10 pb-10 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="font-semibold">No interviews found.</p>
            <p className="text-sm">{interviews.length > 0 ? "Try adjusting your filters." : "No interviews scheduled yet."}</p>
        </CardContent></Card>
      )}

      {filteredInterviews.length > 0 && (
        <div className="grid gap-6">
          {filteredInterviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-4">
                <Avatar className="h-10 w-10">
                    <AvatarFallback className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {interview.candidateName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "N/A"}
                      </span>
                    </AvatarFallback>
                </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                      <div>
                        <h3 className="text-lg font-semibold">{interview.candidateName}</h3>
                        <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 sm:mt-0 flex-wrap">
                        <Badge className={`${getStatusColor(interview.status)} capitalize text-xs`}>{interview.status}</Badge>
                        <Badge className={`${getTypeColor(interview.interviewType)} capitalize text-xs`}>{interview.interviewType}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1.5"> <Calendar className="h-3.5 w-3.5" /> <span>{formatDateForDisplay(interview.interviewTimestamp, interview.interviewDate)}</span> </div>
                      <div className="flex items-center space-x-1.5"> <Clock className="h-3.5 w-3.5" /> <span>{interview.interviewTime} ({interview.duration})</span> </div>
                      <div className="flex items-center space-x-1.5"> <User className="h-3.5 w-3.5" /> <span>{interview.interviewer}</span> </div>
                      <div className="flex items-center space-x-1.5 truncate">
                        {interview.interviewFormat === "Video Call" ? <Video className="h-3.5 w-3.5 flex-shrink-0" /> : <MapPin className="h-3.5 w-3.5 flex-shrink-0" />}
                        <span className="truncate" title={interview.locationOrLink}>{interview.locationOrLink}</span>
                      </div>
                    </div>

                    {interview.notes && <p className="text-xs bg-gray-50 p-2 rounded-md border text-gray-600">Notes: {interview.notes}</p>}
                    
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}