/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, Send, Clock, Reply, Plus, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  submitVideoQuestion,
  getVideoQuestions,
  // deleteVideoQuestion,
} from "@/actions/student/videoqa";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface VideoQuestion {
  id: string;
  question: string;
  timestamp?: number | null;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    fatherName: string;
    lastName: string;
  };
  responses: {
    id: string;
    response: string;
    createdAt: string;
    instructor: {
      firstName: string;
      fatherName: string;
      lastName: string;
    };
  }[];
}

interface TraditionalQAProps {
  packageId: string;
  lang: string;
  studentId: number;
}

export default function TraditionalQA({
  studentId,
  packageId,
  lang,
}: TraditionalQAProps) {
  // const { data: session } = useSession();
  const [questions, setQuestions] = useState<VideoQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const result = await getVideoQuestions(packageId);
      if (result.success && Array.isArray(result.data)) {
        const questionsWithStringDates = result.data.map((q: any) => ({
          id: q.id,
          question: q.question,
          timestamp: q.timestamp ?? null,
          createdAt: q.createdAt ? q.createdAt.toString() : "",
          student: q.student
            ? {
                id: q.student.id,
                firstName: q.student.firstName,
                fatherName: q.student.fatherName,
                lastName: q.student.lastName,
              }
            : { id: "", firstName: "", fatherName: "", lastName: "" },
          responses: Array.isArray(q.responses)
            ? q.responses.map((r: any) => ({
                id: r.id,
                response: r.response,
                createdAt: r.createdAt ? r.createdAt.toString() : "",
                instructor: r.instructor
                  ? {
                      firstName: r.instructor.firstName,
                      fatherName: r.instructor.fatherName,
                      lastName: r.instructor.lastName,
                    }
                  : { firstName: "", fatherName: "", lastName: "" },
              }))
            : [],
        }));
        setQuestions(questionsWithStringDates);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      // Accept both string and number for studentId
      const result = await submitVideoQuestion(
        studentId,
        packageId,
        newQuestion.trim()
      );
      if (result.success) {
        setNewQuestion("");
        setDialogOpen(false);
        await loadQuestions();
      } else {
        alert(
          lang === "en" ? "Failed to submit question" : "ጥያቄን ማስገባት አልተሳካም"
        );
      }
    } catch (error) {
      console.error("Error submitting question:", error);
      alert(
        lang === "en" ? "Error submitting question" : "ጥያቄን በማስገባት ላይ ስህተት"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // const handleDeleteQuestion = async (questionId: string) => {
  //   const confirmMessage =
  //     lang === "en"
  //       ? "Are you sure you want to delete this question?"
  //       : "ይህን ጥያቄ መሰረዝ እርግጠኛ ነዎት?";
  //   if (!confirm(confirmMessage)) return;
  //   try {
  //     const result = await deleteVideoQuestion(questionId);
  //     if (result.success) {
  //       await loadQuestions();
  //     } else {
  //       alert(lang === "en" ? "Failed to delete question" : "ጥያቄን መሰረዝ አልተሳካም");
  //     }
  //   } catch (error) {
  //     console.error("Error deleting question:", error);
  //     alert(lang === "en" ? "Error deleting question" : "ጥያቄን በመሰረዝ ላይ ስህተት");
  //   }
  // };

  return (
    <div className="space-y-3 sm:space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
          <h3 className="text-sm sm:text-base md:text-lg font-semibold truncate">
            {lang === "en" ? "Questions & Answers" : "ጥያቄዎች እና መልሶች"}
          </h3>
          <Badge variant="secondary" className="ml-2">
            {questions.length}
          </Badge>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">
                {lang === "en" ? "Ask Question" : "ጥያቄ ጠይቅ"}
              </span>
              <span className="sm:hidden">+</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                <MessageCircle className="w-5 h-5 text-primary inline-block mr-2" />
                {lang === "en" ? "Ask a Question" : "ጥያቄ ጠይቅ"}
              </DialogTitle>
            </DialogHeader>
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder={
                lang === "en"
                  ? "What would you like to ask about this course?"
                  : "ስለዚህ ኮርስ ምን መጠየቅ ይፈልጋሉ?"
              }
              rows={4}
              disabled={submitting}
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                {lang === "en" ? "Cancel" : "ተወው"}
              </Button>
              <Button
                variant="default"
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || submitting}
              >
                {submitting
                  ? lang === "en"
                    ? "Submitting..."
                    : "በመላክ ላይ..."
                  : lang === "en"
                  ? "Submit Question"
                  : "ጥያቄ ላክ"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-2 sm:space-y-3 flex-1 min-h-[200px]">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center min-h-[200px]">
          <CardContent className="text-center py-6 sm:py-8 px-4">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
            <p className="text-gray-500 text-sm sm:text-base">
              {lang === "en"
                ? "No questions yet. Be the first to ask!"
                : "ገና ምንም ጥያቄ የለም። የመጀመሪያው ጥያቄ ጠይቂ ይሁኑ!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4 flex-1 min-h-0">
          {questions.map((question) => (
            <Card
              key={question.id}
              className="border-l-2 sm:border-l-4 border-l-primary"
            >
              <CardHeader className="flex items-start justify-between gap-2 p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <Avatar className="bg-primary text-white flex-shrink-0 w-8 h-8">
                    <User className="w-4 h-4" />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm truncate">
                      {question.student.firstName} {question.student.fatherName}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        {formatDistanceToNow(new Date(question.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base ml-8 sm:ml-11 leading-relaxed">
                  {question.question}
                </p>
                {question.responses.length > 0 ? (
                  <div className="ml-8 sm:ml-11 space-y-2 sm:space-y-3 border-l-2 border-gray-200 pl-3 sm:pl-4 mt-2">
                    {question.responses.map((response) => (
                      <div key={response.id} className="space-y-1 sm:space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="bg-green-500 text-white flex-shrink-0 w-8 h-8">
                            <User className="w-4 h-4" />
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                              <span className="truncate">
                                {response.instructor.firstName}{" "}
                                {response.instructor.fatherName}
                              </span>
                              <Badge variant="default" className="ml-1 text-xs">
                                {lang === "en" ? "Instructor" : "አስተማሪ"}
                              </Badge>
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(response.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm ml-8 sm:ml-11 leading-relaxed">
                          {response.response}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="ml-8 sm:ml-11 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                      <Reply className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {lang === "en"
                          ? "Waiting for instructor response..."
                          : "የአስተማሪ ምላሽ በመጠባበቅ ላይ..."}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
