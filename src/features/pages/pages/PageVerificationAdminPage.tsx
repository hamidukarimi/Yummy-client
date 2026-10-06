import { useState } from "react";
import { BadgeCheck, ChevronLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import { usePendingPageVerifications } from "@/features/pages/hooks/usePageVerification";
import type { PageOwner } from "@/features/pages/types/page.types";

const PageVerificationAdminPage = () => {
  const navigate = useNavigate();
  const {
    requests,
    total,
    isLoading,
    isError,
    reviewVerification,
    reviewingPageId,
    reviewError,
  } = usePendingPageVerifications();
  const [rejectingPageId, setRejectingPageId] = useState<string>();
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
            <h1 className="text-xl font-bold text-white">
              Page verification
            </h1>
            <p className="text-xs text-zinc-500">
              {total} pending {total === 1 ? "request" : "requests"}
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
            Failed to load verification requests.
          </p>
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 p-8 flex flex-col items-center gap-3 text-center">
            <BadgeCheck size={28} className="text-zinc-600" />
            <p className="text-white text-sm font-semibold">
              No pending requests
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {requests.map((page) => {
            const owner =
              typeof page.owner === "object"
                ? (page.owner as PageOwner)
                : undefined;
            const reason = rejectionReasons[page._id] ?? "";
            const isReviewing = reviewingPageId === page._id;

            return (
              <div
                key={page._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 flex flex-col gap-4"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    {page.avatar ? (
                      <img
                        src={page.avatar}
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {page.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-white font-semibold truncate">
                        {page.name}
                      </h2>
                      <button
                        type="button"
                        onClick={() => navigate(`/pages/${page.slug}`)}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                        aria-label={`Open ${page.name}`}
                      >
                        <ExternalLink size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {page.category}
                      {owner ? ` · @${owner.username}` : ""}
                    </p>
                    {page.verificationRequestedAt && (
                      <p className="text-xs text-zinc-600 mt-1">
                        Requested{" "}
                        {new Date(
                          page.verificationRequestedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {page.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {page.description}
                  </p>
                )}

                {rejectingPageId === page._id && (
                  <textarea
                    value={reason}
                    onChange={(event) =>
                      setRejectionReasons((current) => ({
                        ...current,
                        [page._id]: event.target.value,
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
                      reviewVerification({
                        pageId: page._id,
                        payload: { decision: "approved" },
                      })
                    }
                    disabled={isReviewing}
                    className="flex-1 rounded-xl bg-green-500/15 border border-green-500/30 py-2.5 text-sm font-semibold text-green-400 disabled:opacity-40 cursor-pointer"
                  >
                    {isReviewing ? "Reviewing..." : "Approve"}
                  </button>

                  {rejectingPageId === page._id ? (
                    <button
                      type="button"
                      onClick={() =>
                        reviewVerification({
                          pageId: page._id,
                          payload: {
                            decision: "rejected",
                            rejectionReason: reason.trim(),
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
                      onClick={() => setRejectingPageId(page._id)}
                      disabled={isReviewing}
                      className="flex-1 rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 disabled:opacity-40 cursor-pointer"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PageVerificationAdminPage;
