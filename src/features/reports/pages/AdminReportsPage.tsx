import { ChevronLeft, ExternalLink, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import useAdminReports from "@/features/reports/hooks/useAdminReports";
import type {
  ReportPost,
  ReportReason,
  ReportReporter,
} from "@/features/reports/types/report.types";

const REASON_LABELS: Record<ReportReason, string> = {
  spam: "Spam",
  inappropriate: "Inappropriate",
  misleading: "Misleading",
  other: "Other",
};

const AdminReportsPage = () => {
  const navigate = useNavigate();
  const {
    reports,
    total,
    isLoading,
    isError,
    reviewReport,
    reviewingReportId,
    reviewError,
  } = useAdminReports();

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
            <h1 className="text-xl font-bold text-white">Reported posts</h1>
            <p className="text-xs text-zinc-500">
              {total} pending {total === 1 ? "report" : "reports"}
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
            Failed to load reports.
          </p>
        )}

        {!isLoading && !isError && reports.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 p-8 flex flex-col items-center gap-3 text-center">
            <Flag size={28} className="text-zinc-600" />
            <p className="text-white text-sm font-semibold">
              No pending reports
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {reports.map((report) => {
            const reporter =
              typeof report.reporter === "object"
                ? (report.reporter as ReportReporter)
                : undefined;
            const post =
              typeof report.post === "object"
                ? (report.post as ReportPost)
                : undefined;
            const isReviewing = reviewingReportId === report._id;

            return (
              <div
                key={report._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold">
                    {REASON_LABELS[report.reason]}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(report.createdAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-semibold truncate">
                      {post?.title ?? "Untitled post"}
                    </h2>
                    {post && (
                      <button
                        type="button"
                        onClick={() => navigate(`/posts/${post._id}`)}
                        className="text-zinc-500 hover:text-white cursor-pointer"
                        aria-label="Open reported post"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {post?.page?.name ? `${post.page.name} · ` : ""}
                    Reported by {reporter ? `@${reporter.username}` : "a user"}
                  </p>
                </div>

                {post?.content && (
                  <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                )}

                {report.details && (
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    “{report.details}”
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => reviewReport(report._id)}
                  disabled={isReviewing}
                  className="rounded-xl border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900 disabled:opacity-40 cursor-pointer"
                >
                  {isReviewing ? "Updating..." : "Mark as reviewed"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
