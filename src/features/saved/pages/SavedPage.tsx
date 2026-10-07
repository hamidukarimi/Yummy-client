import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, Plus } from "lucide-react";
import useSavedPosts from "@/features/saved/hooks/useSavedPosts";
import useCollections from "@/features/saved/hooks/useCollections";
import PostCard from "@/features/posts/components/PostCard";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import useAuth from "@/hooks/useAuth";
import type { ApiPost } from "@/features/posts/types/post.types";

const SavedPage = () => {
  const navigate = useNavigate();
  const { user, restoreSession, isInitializing } = useAuth();
  const { posts, isLoading, isError } = useSavedPosts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [naming, setNaming] = useState<"create" | "rename" | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const {
    collections,
    isLoadingCollections,
    collectionPosts,
    isLoadingCollectionPosts,
    isCollectionPostsError,
    createCollection,
    isCreating,
    createError,
    renameCollection,
    isRenaming,
    renameError,
    deleteCollection,
    addPost,
    addError,
    removePost,
    removingPostId,
  } = useCollections(selectedId);

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  const selected = collections.find((collection) => collection._id === selectedId) ?? null;
  const visiblePosts: ApiPost[] = selectedId ? collectionPosts : posts;
  const listLoading = selectedId ? isLoadingCollectionPosts : isLoading;
  const listError = selectedId ? isCollectionPostsError : isError;

  const submitName = async () => {
    const name = draftName.trim();
    if (!name) return;

    try {
      if (naming === "create") {
        const created = await createCollection(name);
        setSelectedId(created._id);
      } else if (naming === "rename" && selectedId) {
        await renameCollection({ id: selectedId, name });
      }
    } catch {
      return;
    }

    setDraftName("");
    setNaming(null);
  };

  const handleAdd = async (collectionId: string, postId: string) => {
    let result: { added: boolean };
    try {
      result = await addPost({ collectionId, postId });
    } catch {
      return;
    }
    const collection = collections.find((item) => item._id === collectionId);
    setActionMessage(
      result.added
        ? `Added to ${collection?.name ?? "collection"}`
        : `Already in ${collection?.name ?? "collection"}`,
    );
  };

  return (
    <div className="min-h-screen bg-black pb-24 mx-auto">
      <div className="px-4 pt-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-white">Saved</h1>
          <button
            type="button"
            onClick={() => {
              setNaming("create");
              setDraftName("");
            }}
            className="flex items-center gap-1 text-sm text-[#F7C12B] cursor-pointer"
          >
            <Plus size={16} />
            New collection
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-sm cursor-pointer ${
              selectedId === null
                ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                : "border-zinc-700 text-zinc-300"
            }`}
          >
            All
          </button>
          {collections.map((collection) => (
            <button
              key={collection._id}
              type="button"
              onClick={() => setSelectedId(collection._id)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-sm cursor-pointer ${
                selectedId === collection._id
                  ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {collection.name}
              {typeof collection.postCount === "number" ? ` (${collection.postCount})` : ""}
            </button>
          ))}
          {isLoadingCollections && <Spinner size="sm" />}
        </div>

        {selected && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setNaming("rename");
                setDraftName(selected.name);
              }}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm(`Delete “${selected.name}”? Saved posts stay in All.`)) {
                  return;
                }
                void deleteCollection(selected._id).then(() => setSelectedId(null));
              }}
              className="text-xs text-red-400 cursor-pointer"
            >
              Delete collection
            </button>
          </div>
        )}

        {naming && (
          <div className="flex gap-2">
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              maxLength={40}
              placeholder={naming === "create" ? "Date night" : "Collection name"}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
            />
            <button
              type="button"
              onClick={() => void submitName()}
              disabled={isCreating || isRenaming || draftName.trim().length === 0}
              className="px-3 rounded-xl bg-[#F7C12B] text-black text-sm font-semibold disabled:opacity-40 cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setNaming(null)}
              className="px-3 text-sm text-zinc-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {(createError || renameError || addError) && (
          <Alert
            variant="error"
            message={(createError ?? renameError ?? addError)?.message ?? "Something went wrong"}
          />
        )}
        {actionMessage && <p className="text-xs text-green-400">{actionMessage}</p>}
      </div>

      <div className="px-4 mt-4">
        {listLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {listError && (
          <p className="text-zinc-500 text-sm text-center py-16">
            Failed to load saved posts.
          </p>
        )}

        {!listLoading && !listError && visiblePosts.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
              <Bookmark size={24} className="text-zinc-600" />
            </div>
            <p className="text-white font-semibold text-sm">
              {selected ? "No posts in this collection" : "No saved posts yet"}
            </p>
            <p className="text-zinc-500 text-xs text-center">
              {selected
                ? "Add a saved post to this collection from All."
                : "Tap the bookmark icon on any post to save it here."}
            </p>
            {!selected && (
              <button
                onClick={() => navigate("/")}
                className="text-[#F7C12B] text-sm hover:underline mt-1"
              >
                Explore posts
              </button>
            )}
          </div>
        )}

        {!listLoading && !listError && visiblePosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-y-9 lg:mt-3"
          >
            {visiblePosts.map((post) => (
              <div key={post._id} className="flex flex-col gap-2">
                <PostCard post={post} />
                {selectedId ? (
                  <button
                    type="button"
                    onClick={() => removePost({ collectionId: selectedId, postId: post._id })}
                    disabled={removingPostId === post._id}
                    className="text-xs text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40"
                  >
                    {removingPostId === post._id ? "Removing..." : "Remove from collection"}
                  </button>
                ) : (
                  collections.length > 0 && (
                    <select
                      defaultValue=""
                      onChange={(event) => {
                        const collectionId = event.target.value;
                        event.target.value = "";
                        if (collectionId) void handleAdd(collectionId, post._id);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-300"
                      aria-label={`Add ${post.title ?? "post"} to a collection`}
                    >
                      <option value="">Add to collection</option>
                      {collections.map((collection) => (
                        <option key={collection._id} value={collection._id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  )
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
