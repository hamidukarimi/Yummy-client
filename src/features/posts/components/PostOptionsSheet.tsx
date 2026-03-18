import { useNavigate } from "react-router-dom";
import {
  Link,
  Bookmark,
  Pencil,
  Trash2,
  Archive,
  Flag,
  Pin,
} from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import BottomSheetItem from "@/components/ui/BottomSheetItem";
import useToggleSave from "@/features/saved/hooks/useToggleSave";
import useAuth from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  isOwner: boolean;
  onDelete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PostOptionsSheet = ({
  isOpen,
  onClose,
  postId,
  isOwner,
  onDelete,
}: PostOptionsSheetProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleSave, isPending: isSavePending } = useToggleSave(postId);
  const isSaved = user?.savedPosts?.includes(postId) ?? false;

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/posts/${postId}`,
    );
    alert("Link copied to clipboard!");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <BottomSheetItem
        icon={<Link size={18} />}
        label="Copy link"
        onClick={() => void copyLink()}
      />

      {/* Save post — for everyone */}
      <BottomSheetItem
        icon={
          <Bookmark
            size={18}
            className={isSaved ? "fill-[#F7C12B] text-[#F7C12B]" : ""}
          />
        }
        label={isSaved ? "Unsave post" : "Save post"}
        onClick={() => {
          toggleSave();
          onClose();
        }}
        disabled={isSavePending}
      />

      {isOwner ? (
        <>
          <BottomSheetItem
            icon={<Pin size={18} />}
            label="Pin this post"
            onClick={() => {
              onClose();
            }}
            disabled
          />
          <BottomSheetItem
            icon={<Pencil size={18} />}
            label="Edit post"
            onClick={() => {
              onClose();
              navigate(`/posts/${postId}/edit`);
            }}
          />
          <BottomSheetItem
            icon={<Archive size={18} />}
            label="Move to archive"
            onClick={() => {
              onClose();
            }}
            disabled
          />
          <BottomSheetItem
            icon={<Trash2 size={18} />}
            label="Delete post"
            onClick={() => {
              onClose();
              onDelete();
            }}
            variant="danger"
          />
        </>
      ) : (
        <BottomSheetItem
          icon={<Flag size={18} />}
          label="Report post"
          onClick={() => {
            onClose();
          }}
          variant="danger"
          disabled
        />
      )}
    </BottomSheet>
  );
};

export default PostOptionsSheet;
