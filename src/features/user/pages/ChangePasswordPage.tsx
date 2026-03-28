import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import ChangePasswordForm from "@/features/user/components/ChangePasswordForm";

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="flex items-center px-4 pt-5 pb-4 max-w-md mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Change password</span>
        </motion.button>
      </div>

      <div className="px-4 flex justify-center pt-2">
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default ChangePasswordPage;
