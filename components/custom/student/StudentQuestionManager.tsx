"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Send,
  Plus,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

interface Question {
  id: string;
  question: string;
  courseName: string;
  timestamp: number | null;
  type: string;
  createdAt: string;
  hasResponse: boolean;
  responses: {
    id: string;
    response: string;
    ustazName: string;
    createdAt: string;
  }[];
}

export default function StudentQuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/student/questions");
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        toast.error("Failed to load questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editText.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/student/questions/${editingQuestion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: editText.trim() }),
      });

      if (response.ok) {
        toast.success("Question updated successfully!");
        setEditingQuestion(null);
        setEditText("");
        fetchQuestions();
      } else {
        toast.error("Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/student/questions/${deletingQuestion.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question deleted successfully!");
        setDeletingQuestion(null);
        fetchQuestions();
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditText(question.question);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const answeredQuestions = questions.filter(q => q.hasResponse);
  const pendingQuestions = questions.filter(q => !q.hasResponse);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingQuestions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{answeredQuestions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No questions yet</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{question.question}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Course: {question.courseName}</span>
                        <span>Type: {question.type}</span>
                        <span>Asked: {new Date(question.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={question.hasResponse ? "default" : "secondary"}>
                        {question.hasResponse ? "Answered" : "Pending"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingQuestion(question)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Responses */}
                  {question.responses.length > 0 && (
                    <div className="space-y-2">
                      {question.responses.map((response) => (
                        <div key={response.id} className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">{response.ustazName}</span>
                            <span className="text-xs text-green-600">
                              {new Date(response.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-green-700">{response.response}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter your question..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditQuestion} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingQuestion} onOpenChange={() => setDeletingQuestion(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}