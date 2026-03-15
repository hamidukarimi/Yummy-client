import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, DollarSign, Plus, X, AlertCircle } from "lucide-react";
import usePost from "@/features/posts/hooks/usePost";
import useEditPost from "@/features/posts/hooks/useEditPost";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import type { ApiPost, PostType } from "@/features/posts/types/post.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "announcement", label: "Announcement" },
  { value: "promotion", label: "Promotion" },
  { value: "menu_item", label: "Menu Item" },
];

const PRICE_TYPES: PostType[] = ["food", "promotion", "menu_item"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditPostFormProps {
  postId: string;
}

interface InnerFormProps {
  post: ApiPost;
  postId: string;
  onSuccess: () => void;
}

// ─── Inner Form ───────────────────────────────────────────────────────────────

const InnerForm = ({ post, postId, onSuccess }: InnerFormProps) => {
  const navigate = useNavigate();
  const { editPost, isPending, error, isSuccess } = useEditPost(postId);

  const [postType, setPostType] = useState<PostType>(post.type);
  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>(post.images ?? []);
  const [price, setPrice] = useState(
    post.price !== undefined ? String(post.price) : "",
  );
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(post.tags ?? []);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => onSuccess(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  // ─── Helpers ────────────────────────────────────────────────────────────

  const addImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed || images.includes(trimmed)) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrl("");
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,$/, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    editPost({
      type: postType,
      content: content.trim(),
      ...(title.trim() && { title: title.trim() }),
      ...(images.length > 0 && { images }),
      ...(price && !isNaN(Number(price)) && { price: Number(price) }),
      ...(tags.length > 0 && { tags }),
    });
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="text-white"
        >
          <ChevronLeft size={22} />
        </motion.button>
        <h1 className="text-[#F7C12B] font-bold text-lg">Edit Post</h1>
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="text-[#F7C12B] font-semibold text-sm disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="px-4 flex flex-col gap-6 max-w-md mx-auto">
        {/* ── Error / Success ── */}
        {error && <Alert variant="error" message={error.message} />}
        {isSuccess && (
          <Alert
            variant="success"
            message="Post updated and resubmitted for review!"
          />
        )}

        {/* ── Review Warning ── */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle size={16} className="text-[#F7C12B] shrink-0 mt-0.5" />
          <p className="text-zinc-400 text-xs leading-relaxed">
            Editing this post will resubmit it for review. It will be
            temporarily unpublished until approved again.
          </p>
        </div>

        {/* ── Post Type ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-base">Post Type</h2>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPostType(value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors duration-200 ${
                  postType === value
                    ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                    : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-zinc-900" />

        {/* ── Content ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-base">Content</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (Optional)"
            maxLength={120}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post Details..."
              maxLength={2000}
              rows={5}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 resize-none"
            />
            <span className="absolute bottom-3 right-3 text-zinc-600 text-xs">
              {content.length}/2000
            </span>
          </div>
        </div>

        <div className="h-px bg-zinc-900" />

        {/* ── Media ── */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-white font-bold text-base">Media</h2>
            <p className="text-zinc-500 text-xs">
              Image URLs (Add multiple URLs)
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
              placeholder="Enter Image URL"
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
            <button
              onClick={addImage}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#F7C12B] text-black text-sm font-semibold shrink-0"
            >
              <Plus size={15} />
              Add URL
            </button>
          </div>
          {images.length > 0 && (
            <div className="flex flex-col gap-2">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-zinc-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="text-zinc-400 text-xs truncate flex-1">
                    {url}
                  </span>
                  <button
                    onClick={() => removeImage(url)}
                    className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-zinc-900" />

        {/* ── Pricing ── */}
        <AnimatePresence>
          {PRICE_TYPES.includes(postType) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <h2 className="text-white font-bold text-base">Pricing</h2>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <DollarSign size={16} className="text-zinc-500 shrink-0" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter Price"
                  min={0}
                  step={0.01}
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>
              <div className="h-px bg-zinc-900" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tags ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-base">Tags</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex flex-wrap gap-2 min-h-[48px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className="bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none min-w-[100px] flex-1"
            />
          </div>
          <p className="text-zinc-600 text-xs">
            Press comma or Enter to add a tag
          </p>
        </div>

        {/* ── Submit ── */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            fullWidth
            isLoading={isPending}
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
          <p className="text-zinc-600 text-xs text-center">
            Editing will resubmit your post for review before publishing.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Outer Component ──────────────────────────────────────────────────────────

const EditPostForm = ({ postId }: EditPostFormProps) => {
  const navigate = useNavigate();
  const { post, isLoading, isError } = usePost(postId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Post not found.</p>
      </div>
    );
  }

  return (
    <InnerForm post={post} postId={postId} onSuccess={() => navigate(-1)} />
  );
};

export default EditPostForm;
