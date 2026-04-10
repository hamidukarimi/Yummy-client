import { AnimatePresence, motion } from "framer-motion";
import CreatePageForm from "@/features/pages/components/CreatePageForm";

interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePageModal = ({ isOpen, onClose }: CreatePageModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-10 z-50 mx-auto w-[min(920px,calc(100%-2rem))] max-h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-zinc-900 bg-black shadow-2xl"
          >
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <span className="sr-only">Close create post</span>✕
              </button>
              <CreatePageForm onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePageModal;
