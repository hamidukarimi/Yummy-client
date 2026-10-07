import { useState } from "react";
import { ClipboardCheck, ChevronLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import useAdminPostReview from "@/features/posts/hooks/useAdminPostReview";
import type { ApiPost, PostPage } from "@/features/posts/types/post.types";

interface PostAuthor {
  _id?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
}

const getAuthorLabel = (author: ApiPost["author"] | PostAuthor) => {
  if (typeof author === "object" && author) {
    const typed = author as PostAuthor;
    if (typed.username) return `@${typed.username}`;
    return [typed.firstname, typed.lastname].filter(Boolean).join(" ");
  }
  return "Unknown author";
};

const getPage = (page: ApiPost["page"]): PostPage | undefined =>
  typeof page === "object" ? page : undefined;

const AdminPostReviewPage = () => {
  const navigate = useNavigate();
  const {
    posts,
    total,
    isLoading,
    isError,
    reviewPost,
    reviewingPostId,
    reviewError,
  } = useAdminPostReview();
  const [rejectingPostId, setRejectingPostId] = useState<string>();
  const [rejectionReasons, setRejectionReasons] = useState<
    Record<string, string>
  >({});

  return (
    <div className="min-h-screen bg-black px-4 pt-5 pb-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-zinc-900 cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Post review</h1>
            <p className="text-xs text-zinc-500">
              {total} pending {total === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        {reviewError && (
          <Alert variant="error" message={reviewError.message} />
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <p className="text-zinc-500 text-sm text-center py-12">
            Failed to load pending posts.
          </p>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 p-8 flex flex-col items-center gap-3 text-center">
            <ClipboardCheck size={28} className="text-zinc-600" />
            <p className="text-white text-sm font-semibold">
              No posts waiting for review
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((post) => {
            const page = getPage(post.page);
            const reason = rejectionReasons[post._id] ?? "";
            const isReviewing = reviewingPostId === post._id;

            return (
              <div
                key={post._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden flex flex-col"
              >
                {post.images[0] && (
                  <img
                    src={post.images[0]}
                    alt={post.title ?? "Post"}
                    className="w-full h-44 object-cover"
                  />
                )}

                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-white font-semibold truncate">
                          {post.title ?? "Untitled"}
                        </h2>
                        <button
                          type="button"
                          onClick={() => navigate(`/posts/${post._id}`)}
                          className="text-zinc-500 hover:text-white cursor-pointer"
                          aria-label="Open post"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {post.type.replace("_", " ")}
                        {page ? ` · ${page.name}` : ""}
                        {` · ${getAuthorLabel(post.author)}`}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Submitted {new Date(post.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4">
                    {post.content}
                  </p>

                  {rejectingPostId === post._id && (
                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setRejectionReasons((current) => ({
                          ...current,
                          [post._id]: event.target.value,
                        }))
                      }
                      maxLength={500}
                      placeholder="Reason for rejection..."
                      className="w-full min-h-24 resize-none rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        reviewPost({
                          postId: post._id,
                          payload: { status: "approved" },
                        })
                      }
                      disabled={isReviewing}
                      className="flex-1 rounded-xl bg-green-500/15 border border-green-500/30 py-2.5 text-sm font-semibold text-green-400 disabled:opacity-40 cursor-pointer"
                    >
                      {isReviewing ? "Reviewing..." : "Approve"}
                    </button>

                    {rejectingPostId === post._id ? (
                      <button
                        type="button"
                        onClick={() =>
                          reviewPost({
                            postId: post._id,
                            payload: {
                              status: "rejected",
                              rejectedReason: reason.trim(),
                            },
                          })
                        }
                        disabled={isReviewing || !reason.trim()}
                        className="flex-1 rounded-xl bg-red-500/15 border border-red-500/30 py-2.5 text-sm font-semibold text-red-400 disabled:opacity-40 cursor-pointer"
                      >
                        Confirm rejection
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setRejectingPostId(post._id)}
                        disabled={isReviewing}
                        className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 disabled:opacity-40 cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPostReviewPage;
