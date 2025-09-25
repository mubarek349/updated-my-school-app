"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, CheckCircle, Clock, RefreshCw, Send, LogOut, User } from "lucide-react";
import { getCurrentUstaz, logout } from "@/actions/ustazResponder/authentication";
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

interface UstazData {
  ustazname: string;
  [key: string]: unknown;
}

export default function UstazDashboard() {
  const [ustazData, setUstazData] = useState<UstazData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [ustazResult, questionsResponse] = await Promise.all([
        getCurrentUstaz(),
        fetch("/api/ustaz/questions")
      ]);

      if (ustazResult.success) {
        setUstazData(ustazResult.data);
      } else {
        toast.error(ustazResult.message);
        if (ustazResult.message === "Account suspended" || ustazResult.message === "Not authenticated") {
          router.push("/en/login");
          return;
        }
      }

      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      } else {
        toast.error("Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
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
    try {
      const res = await fetch("/api/ustaz/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          response: response.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Response submitted successfully!");
        setResponse("");
        setSelectedQuestion(null);
        fetchData();
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
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const unansweredQuestions = questions.filter((q) => !q.hasResponse);
  const answeredQuestions = questions.filter((q) => q.hasResponse);

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
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 w-fit">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-slate-900">{questions.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
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
                    <CardTitle className="text-sm font-medium">Answered</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {answeredQuestions.length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions Section */}
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
                        <p className="text-slate-500">No pending questions</p>
                      </div>
                    ) : (
                      unansweredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            selectedQuestion?.id === question.id
                              ? "bg-blue-50 border-blue-200"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <Badge variant="outline" className="w-fit text-xs">
                              {question.courseName}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-1 truncate">{question.chapterName}</p>
                          <p className="text-slate-700 text-sm line-clamp-2 mb-2">{question.question}</p>
                          <p className="text-xs text-slate-500">By: {question.studentName}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Response Form */}
                <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-blue-500" />
                      {selectedQuestion ? "Respond to Question" : "Select a Question"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedQuestion ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{selectedQuestion.courseName}</Badge>
                            <span className="text-xs text-slate-500">
                              {selectedQuestion.chapterName}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 mb-2">{selectedQuestion.question}</p>
                          <p className="text-xs text-slate-500">By: {selectedQuestion.studentName}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Your Response</label>
                          <Textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your response here..."
                            className="min-h-32"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSubmitResponse}
                            disabled={isSubmitting || !response.trim()}
                            className="flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            {isSubmitting ? "Submitting..." : "Submit Response"}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedQuestion(null);
                              setResponse("");
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Select a question to respond</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}