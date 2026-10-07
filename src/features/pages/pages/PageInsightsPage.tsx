import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Eye, Heart, Users } from "lucide-react";
import { getPageInsightsService } from "@/features/pages/services/insights.service";
import { parseApiError } from "@/utils/errorHandler";
import Spinner from "@/components/ui/Spinner";

const PageInsightsPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights", slug],
    queryFn: async () => {
      try {
        return await getPageInsightsService(slug);
      } catch (err) {
        throw parseApiError(err);
      }
    },
    enabled: Boolean(slug),
  });

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
          <h1 className="text-xl font-bold text-white">Insights</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {error && (
          <p className="text-zinc-500 text-sm text-center py-12">{error.message}</p>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Followers", value: data.followersCount, icon: Users },
                { label: "Posts", value: data.postCount, icon: null },
                { label: "Views", value: data.totalViews, icon: Eye },
                { label: "Likes", value: data.totalLikes, icon: Heart },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-800 p-3">
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                  <p className="text-white text-lg font-bold">{stat.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {data.posts.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-8">No posts yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {data.posts.map((post) => (
                <button
                  key={post._id}
                  type="button"
                  onClick={() => navigate(`/posts/${post._id}`)}
                  className="rounded-2xl border border-zinc-800 p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:border-zinc-700"
                >
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {post.title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-zinc-500 capitalize">
                      {post.type.replace("_", " ")} · {post.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-300 shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye size={13} /> {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={13} /> {post.likeCount.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageInsightsPage;
