import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const BottomSheet = ({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) => {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* ── Sheet (mobile) / Modal (desktop) ── */}
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="
              fixed z-50 bg-zinc-950 border border-zinc-800
              bottom-0 left-0 right-0 rounded-t-3xl
              md:bottom-auto md:left-1/2 md:top-1/2
              md:-translate-x-1/2 md:-translate-y-1/2
              md:w-96 md:rounded-2xl
            "
          >
            {/* ── Drag Handle ── */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-zinc-700" />
            </div>

            {/* ── Title (optional) ── */}
            {title && (
              <div className="px-5 py-3 border-b border-zinc-800">
                <h3 className="text-white font-semibold text-sm text-center">
                  {title}
                </h3>
              </div>
            )}

            {/* ── Content ── */}
            <div className="pb-8 md:pb-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
