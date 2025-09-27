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
  response?: string;
  responseId?: number;
}

interface UstazData {
  ustazname: string;
  [key: string]: unknown;
}

export default function UstazDashboard() {
  const [ustazData, setUstazData] = useState<UstazData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const [ustazResult, questionsResponse] = await Promise.all([
        getCurrentUstaz(),
        fetch("/api/ustaz/questions"),
      ]);

      if (ustazResult.success) {
        setUstazData(ustazResult.data);
      } else {
        toast.error(ustazResult.message);
        await logout();
        router.refresh();
        return;
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
      const url = isEditing
        ? `/api/ustaz/responses/${selectedQuestion.responseId}`
        : "/api/ustaz/respond";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          response: response.trim(),
        }),
      });

      if (res.ok) {
        toast.success(
          isEditing
            ? "Response updated successfully!"
            : "Response submitted successfully!"
        );
        setResponse("");
        setSelectedQuestion(null);
        setIsEditing(false);
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

  const handleEditResponse = (question: Question) => {
    setSelectedQuestion(question);
    setResponse(question.response || "");
    setIsEditing(true);
  };

  const handleDeleteResponse = async (responseId: number) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/ustaz/responses/${responseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Response deleted successfully!");
        fetchData();
      } else {
        toast.error("Failed to delete response");
      }
    } catch (error) {
      console.error("Error deleting response:", error);
      toast.error("Failed to delete response");
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
              {/* Stats Cards */}
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
                              <p>Student: {question.studentName}</p>
                              <p>Course: {question.courseName}</p>
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
                        <p className="text-slate-500">No answered questions</p>
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
                              <p>Student: {question.studentName}</p>
                              <p>Course: {question.courseName}</p>
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
