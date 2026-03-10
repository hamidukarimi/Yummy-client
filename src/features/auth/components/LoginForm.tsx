import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";
import useLogin from "@/features/auth/hooks/useLogin";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// ─── Component ────────────────────────────────────────────────────────────────

const LoginForm = () => {
  const { login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error Alert */}
      <Alert
        visible={isError}
        type="error"
        message={error?.message ?? "Something went wrong."}
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          {...register("email")}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
          {...register("password")}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isPending}
          className="mt-2"
        >
          Sign in
        </Button>
      </form>

      {/* Footer */}
      <p className="text-sm text-center text-zinc-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-indigo-600 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginForm;