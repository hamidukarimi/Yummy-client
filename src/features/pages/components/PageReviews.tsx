import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Star, Trash2 } from "lucide-react";
import useReviews from "@/features/pages/hooks/useReviews";
import useAuth from "@/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import type { ReportReason } from "@/features/reports/types/report.types";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "misleading", label: "Misleading" },
  { value: "other", label: "Other" },
];

interface PageReviewsProps {
  slug: string;
  isOwner: boolean;
}

const PageReviews = ({ slug, isOwner }: PageReviewsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    reviews,
    averageRating,
    ratingCount,
    mine,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    saveReview,
    updateReview,
    isSaving,
    saveError,
    deleteReview,
    deletingReviewId,
    reportReview,
    isReporting,
    reportError,
  } = useReviews(slug);

  const [rating, setRating] = useState(mine?.rating ?? 0);
  const [content, setContent] = useState(mine?.content ?? "");

  useEffect(() => {
    if (!mine) return;
    setRating(mine.rating);
    setContent(mine.content ?? "");
  }, [mine]);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [reportMessage, setReportMessage] = useState("");

  const submit = async () => {
    if (rating < 1) return;
    const text = content.trim();
    try {
      if (mine) {
        await updateReview({
          reviewId: mine._id,
          rating,
          ...(text ? { content: text } : {}),
        });
      } else {
        await saveReview({ rating, ...(text ? { content: text } : {}) });
      }
    } catch {
      return;
    }
  };

  const submitReport = async () => {
    if (!reportingId) return;
    try {
      await reportReview({
        reviewId: reportingId,
        payload: {
          reason,
          ...(details.trim() ? { details: details.trim() } : {}),
        },
      });
    } catch {
      return;
    }
    setReportingId(null);
    setDetails("");
    setReportMessage("Report submitted");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-white font-semibold text-sm">
          {averageRating === null ? "No ratings yet" : `${averageRating} · ${ratingCount} ${ratingCount === 1 ? "review" : "reviews"}`}
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}
      {isError && <p className="text-zinc-500 text-sm">Failed to load reviews.</p>}

      {!isOwner && user && (
        <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 p-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className="cursor-pointer"
              >
                <Star
                  size={18}
                  className={value <= rating ? "text-[#F7C12B] fill-[#F7C12B]" : "text-zinc-600"}
                />
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Write a review (optional)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B] resize-none"
          />
          {saveError && <Alert variant="error" message={saveError.message} />}
          <button
            type="button"
            onClick={() => void submit()}
            disabled={isSaving || rating < 1}
            className="self-start bg-[#F7C12B] text-black text-sm font-semibold rounded-xl px-3 py-1.5 disabled:opacity-40 cursor-pointer"
          >
            {isSaving ? "Saving..." : mine ? "Update review" : "Post review"}
          </button>
        </div>
      )}

      {!user && (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-[#F7C12B] self-start cursor-pointer"
        >
          Log in to review
        </button>
      )}

      {reviews.map((review) => {
        const canDelete =
          isOwner || user?.role === "admin" || (user ? review.author.id === user.id : false);
        return (
          <div key={review._id} className="flex flex-col gap-1 border-b border-zinc-900 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-white font-semibold">@{review.author.username}</p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                      key={value}
                      size={12}
                      className={value <= review.rating ? "text-[#F7C12B] fill-[#F7C12B]" : "text-zinc-700"}
                    />
                  ))}
                </div>
                {review.content && (
                  <p className="text-sm text-zinc-300 mt-1 whitespace-pre-wrap">{review.content}</p>
                )}
              </div>
              <div className="flex gap-1">
                {user && review.author.id !== user.id && (
                  <button
                    type="button"
                    onClick={() => setReportingId(reportingId === review._id ? null : review._id)}
                    className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"
                    aria-label="Report review"
                  >
                    <Flag size={14} />
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => deleteReview(review._id)}
                    disabled={deletingReviewId === review._id}
                    className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                    aria-label="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {reportingId === review._id && (
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex flex-wrap gap-2">
                  {REASONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setReason(option.value)}
                      className={`px-2.5 py-1 rounded-full border text-xs cursor-pointer ${
                        reason === option.value
                          ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                          : "border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  maxLength={500}
                  placeholder="Details (optional)"
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white"
                />
                {reportError && <Alert variant="error" message={reportError.message} />}
                <button
                  type="button"
                  onClick={() => void submitReport()}
                  disabled={isReporting}
                  className="self-start text-sm font-semibold text-black bg-[#F7C12B] rounded-lg px-3 py-1.5 disabled:opacity-40 cursor-pointer"
                >
                  {isReporting ? "Sending..." : "Submit report"}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {reportMessage && <p className="text-xs text-green-400">{reportMessage}</p>}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-sm text-[#F7C12B] cursor-pointer"
        >
          {isFetchingNextPage ? "Loading..." : "Load more reviews"}
        </button>
      )}
    </div>
  );
};

export default PageReviews;
