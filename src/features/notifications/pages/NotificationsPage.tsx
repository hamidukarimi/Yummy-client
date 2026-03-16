import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CheckCheck,
  Trash2,
  Bell,
  CheckCircle2,
  XCircle,
  UserPlus,
} from "lucide-react";
import useNotifications from "@/features/notifications/hooks/useNotifications";
import Spinner from "@/components/ui/Spinner";
import type {
  ApiNotification,
  NotificationType,
} from "@/features/notifications/types/notification.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "all" | "unread" | "posts" | "pages";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateStr: string): string => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0)  return `${mins}m ago`;
  return "Just now";
};

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "post_approved": return <CheckCircle2 size={18} className="text-green-400" />;
    case "post_rejected": return <XCircle     size={18} className="text-red-400"   />;
    case "new_follower":  return <UserPlus    size={18} className="text-blue-400"  />;
    default:              return <Bell        size={18} className="text-zinc-400"  />;
  }
};

const getNotificationBg = (type: NotificationType): string => {
  switch (type) {
    case "post_approved": return "bg-green-500/10 border-green-500/20";
    case "post_rejected": return "bg-red-500/10 border-red-500/20";
    case "new_follower":  return "bg-blue-500/10 border-blue-500/20";
    default:              return "bg-zinc-900 border-zinc-800";
  }
};

// ─── Notification Item ────────────────────────────────────────────────────────

interface NotificationItemProps {
  notification:       ApiNotification;
  onMarkRead:         (id: string) => void;
  onDelete:           (id: string) => void;
  onNavigate:         (notification: ApiNotification) => void;
}

const NotificationItem = ({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => {
        if (!notification.isRead) onMarkRead(notification._id);
        onNavigate(notification);
      }}
      className={`
        relative flex items-start gap-3 p-4 rounded-2xl border cursor-pointer
        transition-colors duration-200 hover:brightness-110
        ${getNotificationBg(notification.type)}
        ${!notification.isRead ? "opacity-100" : "opacity-60"}
      `}
    >
      {/* ── Unread dot ── */}
      {!notification.isRead && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#F7C12B]" />
      )}

      {/* ── Icon ── */}
      <div className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
        <p className={`text-sm leading-relaxed ${
          notification.isRead ? "text-zinc-400" : "text-white"
        }`}>
          {notification.message}
        </p>
        <span className="text-zinc-600 text-xs">
          {timeAgo(notification.createdAt)}
        </span>
      </div>

      {/* ── Delete button ── */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="absolute bottom-3 right-3 text-zinc-700 hover:text-red-400 transition-colors"
      >
        <Trash2 size={13} />
      </motion.button>
    </motion.div>
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

  const tabs: { key: Tab; label: string; filter: (n: ApiNotification) => boolean }[] = [
    { key: "all",    label: "All",     filter: () => true },
    { key: "unread", label: "Unread",  filter: (n) => !n.isRead },
    { key: "posts",  label: "Posts",   filter: (n) => ["post_approved", "post_rejected"].includes(n.type) },
    { key: "pages",  label: "Pages",   filter: (n) => n.type === "new_follower" },
  ];

  const filteredNotifications = notifications.filter(
    tabs.find((t) => t.key === tab)!.filter
  );

const handleNavigate = (notification: ApiNotification) => {
  if (notification.relatedPost) {
    const postId = typeof notification.relatedPost === "object"
      ? (notification.relatedPost as { _id: string })._id
      : notification.relatedPost;
    navigate(`/posts/${postId}`);
  } else if (notification.relatedPage) {
    const slug = typeof notification.relatedPage === "object"
      ? notification.relatedPage.slug
      : notification.relatedPage;
    navigate(`/pages/${slug}`);
  }
};

  return (
    <div className="min-h-screen bg-black pb-24 max-w-md mx-auto">

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
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#F7C12B] text-black text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Mark all read */}
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
      <div className="flex items-center border-b border-zinc-800 px-4">
        {tabs.map(({ key, label, filter }) => {
          const count = notifications.filter(filter).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-semibold border-b-2 transition-colors duration-200 -mb-px ${
                tab === key
                  ? "border-[#F7C12B] text-[#F7C12B]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === key
                    ? "bg-[#F7C12B] text-black"
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-5">
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
              className="flex flex-col gap-3"
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
    </div>
  );
};

export default NotificationsPage;