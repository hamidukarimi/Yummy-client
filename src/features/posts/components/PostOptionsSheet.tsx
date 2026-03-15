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

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/posts/${postId}`,
    );
    alert("Link copied to clipboard!");
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* ── Copy Link — everyone ── */}
      <BottomSheetItem
        icon={<Link size={18} />}
        label="Copy link"
        onClick={() => void copyLink()}
      />

      {isOwner ? (
        <>
          {/* ── Pin Post ── */}
          <BottomSheetItem
            icon={<Pin size={18} />}
            label="Pin this post"
            onClick={() => {
              onClose();
            }}
            disabled
          />

          {/* ── Edit Post ── */}
          <BottomSheetItem
            icon={<Pencil size={18} />}
            label="Edit post"
            onClick={() => {
              onClose();
              navigate(`/posts/${postId}/edit`);
            }}
          />

          {/* ── Save Post ── */}
          <BottomSheetItem
            icon={<Bookmark size={18} />}
            label="Save post"
            onClick={() => {
              onClose();
            }}
            disabled
          />

          {/* ── Move to Archive ── */}
          <BottomSheetItem
            icon={<Archive size={18} />}
            label="Move to archive"
            onClick={() => {
              onClose();
            }}
            disabled
          />

          {/* ── Delete Post ── */}
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
        <>
          {/* ── Save Post ── */}
          <BottomSheetItem
            icon={<Bookmark size={18} />}
            label="Save post"
            onClick={() => {
              onClose();
            }}
            disabled
          />

          {/* ── Report Post ── */}
          <BottomSheetItem
            icon={<Flag size={18} />}
            label="Report post"
            onClick={() => {
              onClose();
            }}
            variant="danger"
            disabled
          />
        </>
      )}
    </BottomSheet>
  );
};

export default PostOptionsSheet;
