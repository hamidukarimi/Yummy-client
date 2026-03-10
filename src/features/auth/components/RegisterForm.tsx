import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import type { RegisterFormValues } from "@/features/auth/schemas/register.schema";
import useRegister from "@/features/auth/hooks/useRegister";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enterFromRight: { x: "100%", opacity: 0 },
  enterFromLeft: { x: "-100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitToLeft: { x: "-100%", opacity: 0 },
  exitToRight: { x: "100%", opacity: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const { register: registerUser, isPending, isError, error } = useRegister();

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  // ─── Step Navigation ─────────────────────────────────────────────

  const goNext = async () => {
    const valid = await trigger([
      "firstname",
      "lastname",
      "email",
      "password",
      "confirmPassword",
    ]);

    if (!valid) return;

    // Manually check password match since superRefine
    // is a root-level check that trigger() can't reach
    const values = getValues();
    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    setDirection("forward");
    setStep(2);
  };

  const goBack = () => {
    setDirection("backward");
    setStep(1);
  };

  // ─── Submit ──────────────────────────────────────────────────────

  const onSubmit = (data: RegisterFormValues) => {
    const { confirmPassword: _, ...payload } = data;
    registerUser(payload);
  };

  return (
    <div className="w-full max-w-md flex flex-col gap-6 overflow-hidden">
      {/* Back Arrow */}
      {step === 2 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={goBack}
          className="flex items-center gap-1 text-white w-fit"
        >
          <ChevronLeft size={20} />
        </motion.button>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        {/* Step Indicator */}
        <div className="flex gap-2 mt-2">
          <div
            className={`h-1 w-8 rounded-full transition-colors duration-300 ${step >= 1 ? "bg-[#F7C12B]" : "bg-zinc-700"}`}
          />
          <div
            className={`h-1 w-8 rounded-full transition-colors duration-300 ${step >= 2 ? "bg-[#F7C12B]" : "bg-zinc-700"}`}
          />
        </div>
      </div>

      {/* Error Alert */}
      <Alert
        visible={isError}
        type="error"
        message={error?.message ?? "Something went wrong."}
      />

      {/* Steps */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AnimatePresence mode="wait" initial={false}>
          {/* ── Step 1 ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={
                direction === "forward"
                  ? slideVariants.enterFromLeft
                  : slideVariants.enterFromRight
              }
              animate={slideVariants.center}
              exit={
                direction === "forward"
                  ? slideVariants.exitToLeft
                  : slideVariants.exitToRight
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              {/* Name Row */}
              <div className="flex gap-3">
                <Input
                  id="firstname"
                  type="text"
                  placeholder="Enter Your First Name"
                  autoComplete="given-name"
                  error={errors.firstname}
                  {...register("firstname")}
                />
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Enter Your Last Name"
                  autoComplete="family-name"
                  error={errors.lastname}
                  {...register("lastname")}
                />
              </div>

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
                placeholder="Create Your Password"
                autoComplete="new-password"
                error={errors.password}
                {...register("password")}
              />

              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Your Password"
                autoComplete="new-password"
                error={errors.confirmPassword}
                {...register("confirmPassword")}
              />

              {/* Next Button */}
              <Button type="button" fullWidth onClick={goNext} className="mt-2">
                Next
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-zinc-500 text-sm">or</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Social Buttons */}
              <Button type="button" variant="outline" fullWidth>
                Signup with Google
              </Button>
              <Button type="button" variant="outline" fullWidth>
                Signup with Facebook
              </Button>

              {/* Login Link */}
              <p className="text-sm text-center text-zinc-500 mt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#F7C12B] font-medium hover:underline"
                >
                  Log In
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={
                direction === "forward"
                  ? slideVariants.enterFromRight
                  : slideVariants.enterFromLeft
              }
              animate={slideVariants.center}
              exit={
                direction === "forward"
                  ? slideVariants.exitToLeft
                  : slideVariants.exitToRight
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              <Input
                id="username"
                type="text"
                placeholder="Create a username"
                autoComplete="username"
                error={errors.username}
                {...register("username")}
              />

              <Input
                id="birthday"
                type="date"
                placeholder="Select Your Birthday"
                error={errors.birthday}
                {...register("birthday")}
              />

              {/* Gender Select */}
              <select
                id="gender"
                {...register("gender")}
                className="w-full px-4 py-3 rounded-xl text-sm border border-zinc-700 bg-transparent text-white outline-none focus:border-[#F7C12B] focus:ring-2 focus:ring-[#F7C12B]/20 transition-colors duration-200"
              >
                <option value="" className="bg-zinc-900">
                  Select Your Gender
                </option>
                <option value="male" className="bg-zinc-900">
                  Male
                </option>
                <option value="female" className="bg-zinc-900">
                  Female
                </option>
                <option value="other" className="bg-zinc-900">
                  Other
                </option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-400 -mt-3">
                  {errors.gender.message}
                </p>
              )}

              {/* Location */}
              <select
                id="location"
                {...register("location.country")}
                className="w-full px-4 py-3 rounded-xl text-sm border border-zinc-700 bg-transparent text-white outline-none focus:border-[#F7C12B] focus:ring-2 focus:ring-[#F7C12B]/20 transition-colors duration-200"
              >
                <option value="" className="bg-zinc-900">
                  Select Your Location
                </option>
                <option value="US" className="bg-zinc-900">
                  United States
                </option>
                <option value="GB" className="bg-zinc-900">
                  United Kingdom
                </option>
                <option value="CA" className="bg-zinc-900">
                  Canada
                </option>
                <option value="AU" className="bg-zinc-900">
                  Australia
                </option>
                <option value="DE" className="bg-zinc-900">
                  Germany
                </option>
                <option value="FR" className="bg-zinc-900">
                  France
                </option>
                <option value="IR" className="bg-zinc-900">
                  Iran
                </option>
                <option value="other" className="bg-zinc-900">
                  Other
                </option>
              </select>

              {/* Sign Up Button */}
              <Button
                type="submit"
                fullWidth
                isLoading={isPending}
                className="mt-2"
              >
                Sign Up
              </Button>

              {/* Back Button */}
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={goBack}
              >
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default RegisterForm;
