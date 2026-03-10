import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";
import useLogin from "@/features/auth/hooks/useLogin";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// ─── Component ────────────────────────────────────────────────────────────────

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6">

      {/* Back Arrow */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(-1)}
        className="flex items-center text-white w-fit"
      >
        <ChevronLeft size={28} />
      </motion.button>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="text-3xl font-bold text-white"
      >
        Welcome back
      </motion.h1>

      {/* Error Alert */}
      <Alert
        visible={isError}
        type="error"
        message={error?.message ?? "Something went wrong."}
      />

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4"
      >
        <Input
          id="email"
          type="email"
          placeholder="Enter Your Email"
          autoComplete="email"
          error={errors.email}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          placeholder="Enter Your Password"
          autoComplete="current-password"
          error={errors.password}
          {...register("password")}
        />

        {/* Forgot Password */}
        <div className="flex justify-center">
          <button
            type="button"
            className="text-sm font-bold text-white hover:text-zinc-300 transition-colors"
          >
            forgot password?
          </button>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          fullWidth
          isLoading={isPending}
        >
          Log In
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-zinc-500 text-sm">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Social Buttons */}
        <Button type="button" variant="outline" fullWidth>
          Login with Google
        </Button>
        <Button type="button" variant="outline" fullWidth>
          Login with Facebook
        </Button>

      </motion.form>

      {/* Sign Up Link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-sm text-center text-gray-300 font-bold mt-4"
      >
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#F7C12B] font-bold hover:underline"
        >
          Sign Up
        </Link>
      </motion.p>

    </div>
  );
};

export default LoginForm;