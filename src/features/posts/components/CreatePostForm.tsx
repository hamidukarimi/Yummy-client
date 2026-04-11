import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, DollarSign, Plus, X } from "lucide-react";
import useMyPages from "@/features/pages/hooks/useMyPages";
import useCreatePost from "@/features/posts/hooks/useCreatePost";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import type { PostType } from "@/features/posts/types/post.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "announcement", label: "Announcement" },
  { value: "promotion", label: "Promotion" },
  { value: "menu_item", label: "Menu Item" },
];

const PRICE_TYPES: PostType[] = ["food", "promotion", "menu_item"];

interface CreatePostFormProps {
  onClose?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreatePostForm = ({ onClose }: CreatePostFormProps) => {
  const navigate = useNavigate();
  const { pages, isLoading: pagesLoading } = useMyPages();
  const { createPost, isPending, error, isSuccess } = useCreatePost();

  // ─── Form State ───────────────────────────────────────────────────────────

  const [selectedPageId, setSelectedPageId] = useState("");
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [postType, setPostType] = useState<PostType>("food");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const selectedPage = pages.find(
    (p) => p._id === selectedPageId || p.id === selectedPageId,
  );

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

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    navigate(-1);
  };

  const handleSubmit = () => {
    if (!selectedPageId || !content.trim()) return;

    createPost(
      {
        page: selectedPageId,
        type: postType,
        content: content.trim(),
        ...(title.trim() && { title: title.trim() }),
        ...(images.length > 0 && { images }),
        ...(price && !isNaN(Number(price)) && { price: Number(price) }),
        ...(tags.length > 0 && { tags }),
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            if (onClose) {
              onClose();
            } else {
              navigate(-1);
            }
          }, 1500);
        },
      },
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black pb-10">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className="text-white cursor-pointer hover:bg-zinc-900 rounded-full md:p-2 transition-all"
        >
          <ChevronLeft size={22} />
        </motion.button>

        <h1 className="text-[#F7C12B] font-bold text-lg">Create Post</h1>

        <button
          onClick={handleSubmit}
          disabled={isPending || !selectedPageId || !content.trim()}
          className="text-[#F7C12B] font-semibold text-sm disabled:opacity-40 lg:mr-12 cursor-pointer"
        >
          Submit
        </button>
      </div>

      <div className="px-4 flex flex-col gap-6  mx-auto">
        {/* ── Error / Success ── */}
        {error && <Alert variant="error" message={error.message} />}
        {isSuccess && (
          <Alert
            variant="success"
            message="Post submitted for review successfully!"
          />
        )}

        {/* ── Select Page ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 ">
            <h2 className="text-white font-bold text-base">Select Page</h2>
          </div>

          {pagesLoading ? (
            <div className="h-14 rounded-xl bg-zinc-900 animate-pulse" />
          ) : pages.length === 0 ? (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <p className="text-zinc-500 text-sm">
                You don't have any pages yet.
              </p>
              <button
                onClick={() => navigate("/pages/create")}
                className="text-[#F7C12B] text-sm mt-1 hover:underline cursor-pointer"
              >
                Create a page first
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setPageDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-zinc-900 border transition-colors cursor-pointer ${
                  selectedPage ? "border-[#F7C12B]" : "border-zinc-700"
                }`}
              >
                {selectedPage ? (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden shrink-0">
                      {selectedPage.avatar ? (
                        <img
                          src={selectedPage.avatar}
                          alt={selectedPage.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                          {selectedPage.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-white font-semibold text-sm flex-1 text-left">
                      {selectedPage.name}
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-sm flex-1 text-left">
                    Select a page...
                  </span>
                )}
                <ChevronDown
                  size={18}
                  className={`text-zinc-400 transition-transform duration-200 ${pageDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {pageDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-20 shadow-xl"
                  >
                    {pages.map((page) => (
                      <button
                        key={page.id ?? page._id}
                        onClick={() => {
                          setSelectedPageId(page._id ?? page.id);
                          setPageDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden shrink-0">
                          {page.avatar ? (
                            <img
                              src={page.avatar}
                              alt={page.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                              {page.name[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-white text-sm">{page.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-900" />

        {/* ── Post Type ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-base">Post Type</h2>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPostType(value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors duration-200 cursor-pointer ${
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

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-900" />

        {/* ── Content ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-bold text-base">Content</h2>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (Optional)"
            maxLength={120}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />

          {/* Content textarea */}
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

        {/* ── Divider ── */}
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
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#F7C12B] text-black text-sm font-semibold shrink-0 cursor-pointer"
            >
              <Plus size={15} />
              Add URL
            </button>
          </div>

          {/* Image list */}
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

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-900" />

        {/* ── Pricing (conditional) ── */}
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

        {/* ── Submit Button ── */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            fullWidth
            isLoading={isPending}
            disabled={!selectedPageId || !content.trim()}
            onClick={handleSubmit}
          >
            Submit for Review
          </Button>
          <p className="text-zinc-600 text-xs text-center">
            Your post will be reviewed by our team before publishing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
