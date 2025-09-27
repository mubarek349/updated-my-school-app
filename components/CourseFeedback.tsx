/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Star, User, Calendar } from "lucide-react";
import {
  addFeedback,
  getFeedback,
  getAverageRating,
} from "@/actions/student/courseData";
// import useData from "@/hooks/useData";
import useAction from "@/hooks/useAction";

export default function CourseFeedback({
  studentId,
  courseId,
  lang,
}: {
  studentId: number;
  courseId: string;
  lang: string;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [feedbacks, refreshFeedback, feedbacksLoading] = useAction(
    getFeedback,
    [true, () => {}],
    courseId
  );

  const [averageRating, , ratingLoading] = useAction(
    getAverageRating,
    [true, () => {}],
    courseId
  );

  const [, action, submitting] = useAction(addFeedback, [, () => {}]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && comment.trim()) {
      await action(courseId, studentId, comment, rating);
      refreshFeedback();
      setRating(0);
      setComment("");
      setIsEditing(false);
    }
  };
  
  const userFeedback = feedbacks?.find((f: any) => f.studentId === studentId);
  
  const handleEdit = () => {
    if (userFeedback) {
      setRating(userFeedback.rating);
      setComment(userFeedback.feedback);
      setIsEditing(true);
    }
  };

  const renderStars = (ratingValue: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= ratingValue
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${
              interactive
                ? "cursor-pointer hover:fill-yellow-400 hover:text-yellow-400"
                : ""
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  if (feedbacksLoading || ratingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Feedback Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {lang === "en" ? "Share Your Feedback" : "ግብረመልስዎን ያጋሩ"}
        </h3>

        {/* Average Rating Display */}
        {averageRating && averageRating.count > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {lang === "en" ? "Average Rating" : "የመካከለኛ ደረጃ"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(Math.round(averageRating.average))}
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {averageRating.average.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({averageRating.count}{" "}
                    {lang === "en" ? "reviews" : "ግምገማዎች"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {lang === "en" ? "Your Rating" : "የእርስዎ ደረጃ"}
            </label>
            <div className="flex items-center gap-2">
              {renderStars(hoverRating || rating, true)}
              <span className="ml-2 text-sm text-gray-500">
                {rating > 0
                  ? `${rating} ${lang === "en" ? "star" : "ኮከብ"}${
                      rating > 1 ? "s" : ""
                    }`
                  : lang === "en"
                  ? "Select rating"
                  : "ደረጃ ይምረጡ"}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              {lang === "en" ? "Your Feedback" : "ግብረመልስዎ"}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={
                lang === "en"
                  ? "Share your thoughts about this course..."
                  : "ስለዚህ ኮርስ አስተያየትዎን ያጋሩ..."
              }
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0 || !comment.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {lang === "en" ? "Submitting..." : "በመስቀል ላይ..."}
              </span>
            ) : userFeedback && !isEditing ? (
              lang === "en" ? "Update Feedback" : "ግብረመልስ አዘምን"
            ) : lang === "en" ? (
              "Submit Feedback"
            ) : (
              "ግብረመልስ ይስቀሉ"
            )}
            </button>
            {userFeedback && !isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {lang === "en" ? "Edit" : "አርም"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Feedback List - Displayed below the form */}
      {feedbacks && feedbacks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {lang === "en" ? "Student Feedback" : "Student Feedback"}
          </h3>
          <div className="space-y-2">
            {feedbacks.map((feedback: any) => (
              <div
                key={feedback.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {feedback.user
                            ? `${feedback.user.firstName} ${feedback.user.fatherName}`
                            : lang === "en"
                            ? "Anonymous"
                            : "Anonymous"}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {renderStars(feedback.rating)}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(feedback.createdAt).toLocaleDateString(
                                lang === "en" ? "en-US" : "am-ET",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                      {feedback.feedback}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
