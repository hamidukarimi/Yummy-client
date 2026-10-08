import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Mail, Trash2 } from "lucide-react";
import { useStartConversation } from "@/features/messages/hooks/useMessages";
import useComments from "@/features/comments/hooks/useComments";
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

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

interface PostCommentsProps {
  postId: string;
  canModerate: boolean;
}

const PostComments = ({ postId, canModerate }: PostCommentsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    comments,
    total,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    addComment,
    isAdding,
    addError,
    deleteComment,
    deletingCommentId,
    reportComment,
    isReporting,
    reportError,
  } = useComments(postId);

  const [content, setContent] = useState("");
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const startConversation = useStartConversation();

  const submitComment = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      await addComment(trimmed);
    } catch {
      return;
    }
    setContent("");
  };

  const submitReport = async () => {
    if (!reportingId) return;
    try {
      await reportComment({
        commentId: reportingId,
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
    setReason("spam");
    setReportMessage("Report submitted");
  };

  return (
    <div className="px-4 flex flex-col gap-4">
      <h3 className="text-white font-semibold text-sm md:text-base">
        Comments {total > 0 ? `(${total})` : ""}
      </h3>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {isError && (
        <p className="text-zinc-500 text-sm">Failed to load comments.</p>
      )}

      {messageError && <p className="text-red-400 text-xs">{messageError}</p>}

      {!isLoading && !isError && comments.length === 0 && (
        <p className="text-zinc-500 text-sm">No comments yet. Start the conversation.</p>
      )}

      <div className="flex flex-col gap-3">
        {comments.map((comment) => {
          const canDelete =
            canModerate || (user ? comment.author.id === user.id : false);
          const isDeleting = deletingCommentId === comment._id;

          return (
            <div key={comment._id} className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white">
                    <span className="font-semibold">@{comment.author.username}</span>
                    <span className="text-zinc-600 font-normal"> · {timeAgo(comment.createdAt)}</span>
                  </p>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {user && comment.author.id !== user.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setMessageError("");
                        void startConversation
                          .mutateAsync({ username: comment.author.username })
                          .then((conversation) => navigate(`/messages/${conversation.id}`))
                          .catch((error: { message?: string }) => {
                            setMessageError(error.message ?? "Could not start the conversation");
                          });
                      }}
                      className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"
                      aria-label={`Message @${comment.author.username}`}
                    >
                      <Mail size={14} />
                    </button>
                  )}
                  {user && comment.author.id !== user.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setReportMessage("");
                        setReportingId(reportingId === comment._id ? null : comment._id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-white cursor-pointer"
                      aria-label="Report comment"
                    >
                      <Flag size={14} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment._id)}
                      disabled={isDeleting}
                      className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer disabled:opacity-40"
                      aria-label="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {reportingId === comment._id && (
                <div className="mt-1 flex flex-col gap-2 rounded-xl border border-zinc-800 p-3">
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
                  />
                  {reportError && reportingId === comment._id && (
                    <Alert variant="error" message={reportError.message} />
                  )}
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
      </div>

      {hasNextPage && (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="text-sm text-[#F7C12B] cursor-pointer disabled:opacity-40"
        >
          {isFetchingNextPage ? "Loading..." : "Load more comments"}
        </button>
      )}

      {reportMessage && <p className="text-xs text-green-400">{reportMessage}</p>}

      {user ? (
        <div className="flex flex-col gap-2">
          {addError && <Alert variant="error" message={addError.message} />}
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Write a comment"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B] resize-none"
          />
          <button
            type="button"
            onClick={() => void submitComment()}
            disabled={isAdding || content.trim().length === 0}
            className="self-start bg-[#F7C12B] text-black text-sm font-semibold rounded-xl px-4 py-2 disabled:opacity-40 cursor-pointer"
          >
            {isAdding ? "Posting..." : "Post comment"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-sm text-[#F7C12B] cursor-pointer"
        >
          Log in to comment
        </button>
      )}
    </div>
  );
};

export default PostComments;
