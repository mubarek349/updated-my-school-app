"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import {
  getCurrentUstaz,
  logout,
} from "@/actions/ustazResponder/authentication";
import {
  getUstazCoursePackages,
  getUstazQuestions,
  submitUstazResponse,
  updateUstazResponse,
  deleteUstazResponse,
} from "@/actions/ustazResponder/questions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  question: string;
  studentName: string;
  courseName: string;
  timestamp: number | null;
  type: string;
  createdAt: string;
  hasResponse: boolean;
  response?: string | null;
  responseId?: string | null;
}

interface UstazData {
  ustazname: string;
  [key: string]: unknown;
}

interface CoursePackage {
  id: string;
  name: string;
  description: string | null;
  _count: {
    qandAQuestion: number;
  };
}

export default function UstazDashboard() {
  const [ustazData, setUstazData] = useState<UstazData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [coursePackages, setCoursePackages] = useState<CoursePackage[]>([]);
  const [selectedCoursePackage, setSelectedCoursePackage] = useState<string>("all");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const router = useRouter();

  const fetchData = async (showToast = true) => {
    try {
      setIsLoading(true);
      
      // Show loading toast for better UX
      if (showToast && retryCount === 0) {
        toast.loading("Loading dashboard data...", { id: "fetch-data" });
      }

      const [ustazResult, coursePackagesResult, questionsResult] = await Promise.all([
        getCurrentUstaz(),
        getUstazCoursePackages(),
        getUstazQuestions(selectedCoursePackage),
      ]);

      // Handle ustaz authentication
      if (ustazResult.success) {
        setUstazData(ustazResult.data);
      } else {
        toast.dismiss("fetch-data");
        toast.error(ustazResult.message);
        if (ustazResult.message === "Not authenticated" || ustazResult.message === "Account suspended") {
          await logout();
          router.push("/en/login");
          return;
        }
        throw new Error(ustazResult.message);
      }

      // Handle course packages
      if (coursePackagesResult.success && coursePackagesResult.data) {
        setCoursePackages(coursePackagesResult.data);
      } else {
        console.warn("Failed to load course packages:", coursePackagesResult.error);
        if (showToast) {
          toast.error(coursePackagesResult.error || "Failed to load course packages");
        }
      }

      // Handle questions
      if (questionsResult.success && questionsResult.data) {
        setQuestions(questionsResult.data);
        setRetryCount(0); // Reset retry count on success
        setLastFetchTime(new Date());
        setHasError(false);
        
        if (showToast) {
          toast.dismiss("fetch-data");
          toast.success("Dashboard loaded successfully");
        }
      } else {
        throw new Error(questionsResult.error || "Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      
      if (showToast) {
        toast.dismiss("fetch-data");
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          toast.error(`Failed to load data. Retrying... (${retryCount + 1}/3)`);
          
          // Retry after a delay
          setTimeout(() => {
            fetchData(false);
          }, 2000);
        } else {
          setHasError(true);
          toast.error("Failed to load data after multiple attempts. Please refresh the page.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoursePackageChange = async (coursePackageId: string) => {
    setSelectedCoursePackage(coursePackageId);
    setIsLoading(true);
    
    try {
      toast.loading("Loading questions...", { id: "filter-questions" });
      
      const result = await getUstazQuestions(coursePackageId);
      
      if (result.success && result.data) {
        setQuestions(result.data);
        toast.dismiss("filter-questions");
        
        const packageName = coursePackageId === "all" 
          ? "All Course Packages" 
          : coursePackages.find(pkg => pkg.id === coursePackageId)?.name || "Selected Package";
        
        toast.success(`Loaded ${result.data.length} questions from ${packageName}`);
      } else {
        toast.dismiss("filter-questions");
        toast.error(result.error || "Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.dismiss("filter-questions");
      toast.error("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuestion || !response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    const action = isEditing ? "updating" : "submitting";
    
    try {
      toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} response...`, { 
        id: "submit-response" 
      });
      
      let result;
      if (isEditing && selectedQuestion.responseId) {
        result = await updateUstazResponse(selectedQuestion.responseId, response.trim());
      } else {
        result = await submitUstazResponse(selectedQuestion.id, response.trim());
      }

      if (result.success) {
        toast.dismiss("submit-response");
        toast.success(
          isEditing
            ? "Response updated successfully!"
            : "Response submitted successfully!"
        );
        setResponse("");
        setSelectedQuestion(null);
        setIsEditing(false);
        
        // Refresh data without showing toast
        await fetchData(false);
      } else {
        toast.dismiss("submit-response");
        toast.error(result.error || "Failed to submit response");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.dismiss("submit-response");
      toast.error("Failed to submit response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = (question: Question) => {
    setSelectedQuestion(question);
    setResponse(question.response || "");
    setIsEditing(true);
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (!confirm("Are you sure you want to delete this response? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      toast.loading("Deleting response...", { id: "delete-response" });
      
      const result = await deleteUstazResponse(responseId);

      if (result.success) {
        toast.dismiss("delete-response");
        toast.success("Response deleted successfully!");
        
        // Refresh data without showing toast
        await fetchData(false);
      } else {
        toast.dismiss("delete-response");
        toast.error(result.error || "Failed to delete response");
      }
    } catch (error) {
      console.error("Error deleting response:", error);
      toast.dismiss("delete-response");
      toast.error("Failed to delete response. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setResponse("");
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/en/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading && retryCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-500" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Dashboard</h3>
          <p className="text-slate-600 mb-4">Fetching your questions and responses...</p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <RefreshCw className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-slate-600 mb-6">
            We encountered an error while loading your dashboard. This might be due to a network issue or server problem.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setHasError(false);
                setRetryCount(0);
                fetchData();
              }}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const unansweredQuestions = questions.filter((q) => !q.hasResponse);
  const answeredQuestions = questions.filter((q) => q.hasResponse);
  
  const selectedPackageName = selectedCoursePackage === "all" 
    ? "All Course Packages" 
    : coursePackages.find(pkg => pkg.id === selectedCoursePackage)?.name || "Unknown Package";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Welcome, {ustazData?.ustazname || "Ustaz"}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-600">
                    Manage student questions and responses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => fetchData()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="flex items-center gap-2 w-fit"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {/* Stats Cards */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Questions for: {selectedPackageName}
                  </h2>
                  {lastFetchTime && (
                    <p className="text-xs text-slate-500">
                      Last updated: {lastFetchTime.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Questions
                    </CardTitle>
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">
                      {questions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending
                    </CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">
                      {unansweredQuestions.length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Answered
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {answeredQuestions.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Package Filter */}
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Filter by Course Package
                    {selectedCoursePackage !== "all" && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        Filtered
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="relative">
                      <select
                        value={selectedCoursePackage}
                        onChange={(e) => handleCoursePackageChange(e.target.value)}
                        className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-3 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="all">All Course Packages ({questions.length} questions)</option>
                        {coursePackages.map((pkg) => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg._count.qandAQuestion} questions)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                    {selectedCoursePackage !== "all" && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                          Showing questions from: <span className="font-semibold text-blue-700">{selectedPackageName}</span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCoursePackageChange("all")}
                          className="text-xs"
                        >
                          Show All
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions Section */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Questions & Answers - {selectedPackageName}
                </h2>
                <p className="text-sm text-slate-600">
                  {selectedCoursePackage === "all" 
                    ? "Showing all questions from all course packages" 
                    : `Showing questions from ${selectedPackageName} only`}
                </p>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Pending Questions */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Pending Questions ({unansweredQuestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {unansweredQuestions.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">
                          {selectedCoursePackage === "all" 
                            ? "No pending questions in any course package" 
                            : `No pending questions in ${selectedPackageName}`}
                        </p>
                      </div>
                    ) : (
                      unansweredQuestions.map((question) => (
                        <div
                          key={question.id}
                          onClick={() => handleSelectQuestion(question)}
                          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedQuestion?.id === question.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-slate-900 text-sm">
                                {question.question}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const packageId = coursePackages.find(pkg => pkg.name === question.courseName)?.id;
                                    if (packageId) {
                                      handleCoursePackageChange(packageId);
                                    }
                                  }}
                                >
                                  {question.courseName}
                                </Badge>
                              </div>
                              <p>Student: {question.studentName}</p>
                              <p>
                                Asked:{" "}
                                {new Date(
                                  question.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Answered Questions */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Answered Questions ({answeredQuestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {answeredQuestions.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">
                          {selectedCoursePackage === "all" 
                            ? "No answered questions in any course package" 
                            : `No answered questions in ${selectedPackageName}`}
                        </p>
                      </div>
                    ) : (
                      answeredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="p-3 sm:p-4 border rounded-lg border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-slate-900 text-sm">
                                {question.question}
                              </h4>
                              <Badge className="text-xs bg-green-100 text-green-800">
                                Answered
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const packageId = coursePackages.find(pkg => pkg.name === question.courseName)?.id;
                                    if (packageId) {
                                      handleCoursePackageChange(packageId);
                                    }
                                  }}
                                >
                                  {question.courseName}
                                </Badge>
                              </div>
                              <p>Student: {question.studentName}</p>
                              <p>
                                Asked:{" "}
                                {new Date(
                                  question.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            {question.response && (
                              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                                <p className="font-medium text-green-800">
                                  Your Response:
                                </p>
                                <p className="text-green-700 mt-1">
                                  {question.response}
                                </p>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditResponse(question)}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  question.responseId &&
                                  handleDeleteResponse(question.responseId)
                                }
                                disabled={isDeleting}
                                className="text-xs"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <Dialog open={!!selectedQuestion} onOpenChange={() => {
                setSelectedQuestion(null);
                setResponse("");
                setIsEditing(false);
              }}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Response" : "Respond to Question"}</DialogTitle>
                    <p className="text-sm text-slate-600 font-medium">{selectedQuestion?.question}</p>
                    <p className="text-xs text-slate-500">Student: {selectedQuestion?.studentName} | Course: {selectedQuestion?.courseName}</p>
                  </DialogHeader>
                  <Textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setSelectedQuestion(null);
                      setResponse("");
                      setIsEditing(false);
                    }}>Cancel</Button>
                    <Button onClick={handleSubmitResponse} disabled={isSubmitting || !response.trim()}>
                      {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      {isEditing ? "Update" : "Submit"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
