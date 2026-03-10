import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { changePasswordSchema } from "@/features/user/schemas/changePassword.schema";
import type { ChangePasswordFormValues } from "@/features/user/schemas/changePassword.schema";
import useChangePassword from "@/features/user/hooks/useChangePassword";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// ─── Component ────────────────────────────────────────────────────────────────

const ChangePasswordForm = () => {
  const { changePassword, isPending, isError, isSuccess, error } =
    useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    const { confirmNewPassword: _, ...payload } = data;
    changePassword(payload);
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
        <h2 className="text-xl font-bold text-zinc-900">Change Password</h2>
        <p className="text-sm text-zinc-500">
          After changing your password you will be logged out from all devices.
        </p>
      </div>

      {/* Alerts */}
      <Alert
        visible={isError}
        type="error"
        message={error?.message ?? "Something went wrong."}
      />
      <Alert
        visible={isSuccess}
        type="success"
        message="Password changed successfully. Redirecting to login..."
      />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          id="currentPassword"
          type="password"
          label="Current password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.currentPassword}
          {...register("currentPassword")}
        />

        <Input
          id="newPassword"
          type="password"
          label="New password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.newPassword}
          {...register("newPassword")}
        />

        <Input
          id="confirmNewPassword"
          type="password"
          label="Confirm new password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmNewPassword}
          {...register("confirmNewPassword")}
        />

        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={isPending}
            onClick={() => reset()}
          >
            Reset
          </Button>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isPending}
          >
            Update password
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default ChangePasswordForm;