/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Send,
  LogOut,
} from "lucide-react";
import {
  getCurrentUstaz,
  logout,
} from "@/actions/ustazResponder/authentication";
import {
  getUstazQuestions,
  submitUstazResponse,
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

export default function UstazDashboard() {
  const [ustazData, setUstazData] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const router = useRouter();

  const fetchUstazData = async () => {
    try {
      const result = await getCurrentUstaz();
      console.log("getCurrentUstaz result:", result);
      if (result.success) {
        setUstazData(result.data);
      } else {
        console.error("getCurrentUstaz failed:", result.message);
        toast.error(result.message);
        if (
          result.message === "Account suspended" ||
          result.message === "Not authenticated"
        ) {
          router.push("/en/login");
        }
      }
    } catch (error) {
      console.error("Error fetching ustaz data:", error);
      toast.error("Failed to load profile data");
    }
  };

  const fetchQuestions = async (showToast = true) => {
    try {
      if (showToast && retryCount === 0) {
        toast.loading("Loading questions...", { id: "fetch-questions" });
      }
      
      const result = await getUstazQuestions();
      
      if (result.success && result.data) {
        console.log("Questions data:", result.data);
        setQuestions(result.data);
        setRetryCount(0);
        setLastFetchTime(new Date());
        
        if (showToast) {
          toast.dismiss("fetch-questions");
          toast.success(`Loaded ${result.data.length} questions successfully`);
        }
      } else {
        console.error("Failed to fetch questions:", result.error);
        if (showToast) {
          toast.dismiss("fetch-questions");
          toast.error(result.error || "Failed to load questions");
        }
        throw new Error(result.error || "Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      
      if (showToast) {
        toast.dismiss("fetch-questions");
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          toast.error(`Failed to load questions. Retrying... (${retryCount + 1}/3)`);
          
          setTimeout(() => {
            fetchQuestions(false);
          }, 2000);
        } else {
          toast.error("Failed to load questions after multiple attempts. Please refresh the page.");
        }
      }
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuestion || !response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      toast.loading("Submitting response...", { id: "submit-response" });
      
      const result = await submitUstazResponse(selectedQuestion.id.toString(), response.trim());

      if (result.success) {
        toast.dismiss("submit-response");
        toast.success("Response submitted successfully!");
        setResponse("");
        setSelectedQuestion(null);
        await fetchQuestions(false); // Refresh questions without toast
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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/en/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log("Starting to load dashboard data...");
        await Promise.all([fetchUstazData(), fetchQuestions()]);
        console.log("Dashboard data loaded successfully");
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const unansweredQuestions = questions.filter((q) => !q.hasResponse);
  const answeredQuestions = questions.filter((q) => q.hasResponse);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {ustazData?.ustazname || "Ustaz"}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage student questions and responses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchQuestions()}
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
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4">
          {lastFetchTime && (
            <p className="text-xs text-gray-500 text-right">
              Last updated: {lastFetchTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Questions
              </CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Responses
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {unansweredQuestions.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {answeredQuestions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unanswered Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Pending Questions ({unansweredQuestions.length})
              </CardTitle>
              <CardDescription>
                Questions waiting for your response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {unansweredQuestions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending questions
                </p>
              ) : (
                unansweredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{question.courseName}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1">
                      {question.type}
                    </p>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {question.question}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      By: {question.studentName}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Response Form or Answered Questions */}
          {selectedQuestion ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-500" />
                  Respond to Question
                </CardTitle>
                <CardDescription>
                  Provide a helpful response to the student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">
                      {selectedQuestion.courseName}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <p className="font-medium text-sm mb-1">
                    {selectedQuestion.type}
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    {selectedQuestion.question}
                  </p>
                  <p className="text-xs text-gray-500">
                    By: {selectedQuestion.studentName}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response">Your Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Enter your response to help the student..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmitResponse}
                  disabled={isSubmitting || !response.trim()}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Response
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Answered Questions ({answeredQuestions.length})
                </CardTitle>
                <CardDescription>
                  Questions you have already responded to
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {answeredQuestions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No answered questions yet
                  </p>
                ) : (
                  answeredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="p-4 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-green-100">
                          {question.courseName}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-sm mb-1">
                        {question.type}
                      </p>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {question.question}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        By: {question.studentName}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
