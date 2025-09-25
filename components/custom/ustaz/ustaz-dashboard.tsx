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
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question: string;
  studentName: string;
  courseName: string;
  chapterName: string;
  createdAt: string;
  hasResponse: boolean;
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

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/ustaz/questions");
      console.log("Questions API response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Questions data:", data);
        setQuestions(data);
      } else {
        const errorData = await response.text();
        console.error("Questions API error:", response.status, errorData);
        toast.error("Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    }
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuestion || !response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/ustaz/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          response: response.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Response submitted successfully!");
        setResponse("");
        setSelectedQuestion(null);
        fetchQuestions(); // Refresh questions
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to submit response");
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Failed to submit response");
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
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
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
                      {question.chapterName}
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
                    {selectedQuestion.chapterName}
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
                        {question.chapterName}
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
