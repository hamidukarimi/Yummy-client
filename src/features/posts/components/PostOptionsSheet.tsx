import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Link,
  Mail,
  Bookmark,
  Pencil,
  Trash2,
  Archive,
  Flag,
  Pin,
} from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import BottomSheetItem from "@/components/ui/BottomSheetItem";
import Alert from "@/components/ui/Alert";
import useToggleSave from "@/features/saved/hooks/useToggleSave";
import useAuth from "@/hooks/useAuth";
import useReportPost from "@/features/reports/hooks/useReportPost";
import type { ReportReason } from "@/features/reports/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  isOwner: boolean;
  onDelete: () => void;
  onSendToChat: () => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading" },
  { value: "other", label: "Other" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const PostOptionsSheet = ({
  isOpen,
  onClose,
  postId,
  isOwner,
  onDelete,
  onSendToChat,
}: PostOptionsSheetProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toggleSave, isPending: isSavePending } = useToggleSave(postId);
  const { reportPost, isPending, error, isSuccess, reset } =
    useReportPost(postId);
  const isSaved = user?.savedPosts?.includes(postId) ?? false;
  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");

  const closeSheet = () => {
    setIsReporting(false);
    setReason("spam");
    setDetails("");
    reset();
    onClose();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/posts/${postId}`,
    );
    alert("Link copied to clipboard!");
    closeSheet();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={closeSheet}
      title={isReporting ? "Report post" : undefined}
    >
      {isReporting ? (
        <div className="px-5 pt-2 flex flex-col gap-3">
          {error && <Alert variant="error" message={error.message} />}
          {isSuccess && (
            <Alert variant="success" message="Report submitted." />
          )}

          {!isSuccess && (
            <>
              <div className="flex flex-col gap-2">
                {REPORT_REASONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setReason(option.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium cursor-pointer ${
                      reason === option.value
                        ? "border-[#F7C12B] text-[#F7C12B] bg-[#F7C12B]/10"
                        : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={500}
                placeholder="Add more details (optional)"
                className="w-full min-h-20 resize-none rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="button"
                onClick={() =>
                  reportPost({
                    reason,
                    ...(details.trim() && { details: details.trim() }),
                  })
                }
                disabled={isPending}
                className="w-full rounded-xl bg-red-500/15 border border-red-500/30 py-3 text-sm font-semibold text-red-400 disabled:opacity-40 cursor-pointer"
              >
                {isPending ? "Submitting..." : "Submit report"}
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <BottomSheetItem
            icon={<Mail size={18} />}
            label="Send in chat"
            onClick={() => {
              if (!isAuthenticated) {
                closeSheet();
                navigate("/login");
                return;
              }
              onSendToChat();
              closeSheet();
            }}
          />

          <BottomSheetItem
            icon={<Link size={18} />}
            label="Copy link"
            onClick={() => void copyLink()}
          />

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
              closeSheet();
            }}
            disabled={isSavePending}
          />

          {isOwner ? (
            <>
              <BottomSheetItem
                icon={<Pin size={18} />}
                label="Pin this post"
                onClick={() => {
                  closeSheet();
                }}
                disabled
              />
              <BottomSheetItem
                icon={<Pencil size={18} />}
                label="Edit post"
                onClick={() => {
                  closeSheet();
                  navigate(`/posts/${postId}/edit`);
                }}
              />
              <BottomSheetItem
                icon={<Archive size={18} />}
                label="Move to archive"
                onClick={() => {
                  closeSheet();
                }}
                disabled
              />
              <BottomSheetItem
                icon={<Trash2 size={18} />}
                label="Delete post"
                onClick={() => {
                  closeSheet();
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
                if (!isAuthenticated) {
                  closeSheet();
                  navigate("/login");
                  return;
                }
                setIsReporting(true);
              }}
              variant="danger"
            />
          )}
        </>
      )}
    </BottomSheet>
  );
};

export default PostOptionsSheet;
