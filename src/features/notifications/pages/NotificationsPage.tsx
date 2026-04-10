import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCheck,
  Bell,
  CheckCircle2,
  XCircle,
  UserPlus,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import useNotifications from "@/features/notifications/hooks/useNotifications";
import BottomSheet from "@/components/ui/BottomSheet";
import BottomSheetItem from "@/components/ui/BottomSheetItem";
import Spinner from "@/components/ui/Spinner";
import type {
  ApiNotification,
  NotificationType,
  RelatedPage,
} from "@/features/notifications/types/notification.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "all" | "unread" | "posts" | "pages";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}h ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "Just now";
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "post_approved":
      return <CheckCircle2 size={18} className="text-green-400" />;
    case "post_rejected":
      return <XCircle size={18} className="text-red-400" />;
    case "new_follower":
      return <UserPlus size={18} className="text-blue-400" />;
    default:
      return <Bell size={18} className="text-zinc-400" />;
  }
};

// ─── Notification Item ────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification: ApiNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (notification: ApiNotification) => void;
}

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          if (!notification.isRead) onMarkRead(notification._id);
          onNavigate(notification);
        }}
        className={`
          flex items-start gap-3 px-4 py-4 cursor-pointer
          transition-colors duration-200
          ${!notification.isRead ? "bg-zinc-900/80" : "bg-transparent"}
        `}
      >
        {/* ── Icon ── */}
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* ── Content ── */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p
            className={`text-sm leading-relaxed ${
              notification.isRead ? "text-zinc-400" : "text-white"
            }`}
          >
            {notification.message}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-zinc-600 text-xs">
              {timeAgo(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <div className="w-1.5 h-1.5 rounded-full bg-[#F7C12B]" />
            )}
          </div>
        </div>

        {/* ── Three dots ── */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            setSheetOpen(true);
          }}
          className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 mt-0.5 cursor-pointer"
        >
          <MoreHorizontal size={18} />
        </motion.button>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-zinc-900 mx-4" />

      {/* ── Options Sheet ── */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)}>
        {!notification.isRead && (
          <BottomSheetItem
            icon={<CheckCheck size={18} />}
            label="Mark as read"
            onClick={() => {
              setSheetOpen(false);
              onMarkRead(notification._id);
            }}
          />
        )}
        <BottomSheetItem
          icon={<Trash2 size={18} />}
          label="Delete notification"
          onClick={() => {
            setSheetOpen(false);
            onDelete(notification._id);
          }}
          variant="danger"
        />
      </BottomSheet>
    </>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  const tabs: {
    key: Tab;
    label: string;
    filter: (n: ApiNotification) => boolean;
  }[] = [
    { key: "all", label: "All", filter: () => true },
    { key: "unread", label: "Unread", filter: (n) => !n.isRead },
    {
      key: "posts",
      label: "Posts",
      filter: (n) => ["post_approved", "post_rejected"].includes(n.type),
    },
    { key: "pages", label: "Pages", filter: (n) => n.type === "new_follower" },
  ];

  const filteredNotifications = notifications.filter(
    tabs.find((t) => t.key === tab)!.filter,
  );

  const handleNavigate = (notification: ApiNotification) => {
    if (notification.relatedPost) {
      const postId =
        typeof notification.relatedPost === "object"
          ? (notification.relatedPost as { _id: string })._id
          : notification.relatedPost;
      navigate(`/posts/${postId}`);
    } else if (notification.relatedPage) {
      const slug =
        typeof notification.relatedPage === "object"
          ? (notification.relatedPage as RelatedPage).slug
          : notification.relatedPage;
      navigate(`/pages/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24  mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="text-white"
          >
            <ChevronLeft size={22} />
          </motion.button>
          <h1 className="text-lg font-bold text-white">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => markAllRead()}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
          >
            <CheckCheck size={16} />
            <span className="text-xs">Mark all read</span>
          </motion.button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {tabs.map(({ key, label, filter }) => {
          const count = notifications.filter(filter).length;
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 shrink-0 cursor-pointer ${
                active
                  ? "bg-zinc-800 border-zinc-600 text-white"
                  : "bg-transparent border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`text-xs font-semibold ${
                    active ? "text-[#F7C12B]" : "text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="md" />
        </div>
      )}

      {isError && (
        <p className="text-zinc-500 text-sm text-center py-16">
          Failed to load notifications.
        </p>
      )}

      <AnimatePresence mode="wait">
        {!isLoading && !isError && (
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
                  <Bell size={24} className="text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">No notifications here.</p>
              </div>
            )}

            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={(id) => markRead(id)}
                onDelete={(id) => deleteNotification(id)}
                onNavigate={handleNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
