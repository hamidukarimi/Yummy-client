import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Hash } from "lucide-react";
import useFeed from "@/features/feed/hooks/useFeed";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";

const TagPage = () => {
  const navigate = useNavigate();
  const { tag = "" } = useParams<{ tag: string }>();

  const { posts, total, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFeed(
      { type: "tag", value: tag, label: tag },
      false,
    );

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-zinc-900 cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-1">
            <Hash size={16} className="text-[#F7C12B]" />
            {tag}
          </h1>
          {!isLoading && !isError && (
            <p className="text-xs text-zinc-500">
              {total} {total === 1 ? "post" : "posts"}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      )}

      {isError && (
        <p className="text-zinc-500 text-sm text-center py-16">
          Failed to load posts for this tag.
        </p>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-16">
          No posts with this tag yet.
        </p>
      )}

      {!isLoading && !isError && posts.length > 0 && (
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-y-9 px-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-sm text-[#F7C12B] cursor-pointer disabled:opacity-40"
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TagPage;
