import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

// ─── Component ────────────────────────────────────────────────────────────────

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-8xl font-black text-indigo-600">404</h1>
          <h2 className="text-2xl font-bold text-zinc-900">Page not found</h2>
          <p className="text-sm text-zinc-500 max-w-sm">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link to="/dashboard">
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;