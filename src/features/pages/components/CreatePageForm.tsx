import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { createPageSchema } from "@/features/pages/schemas/createPage.schema";
import type { CreatePageFormValues } from "@/features/pages/schemas/createPage.schema";
import useCreatePage from "@/features/pages/hooks/useCreatePage";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Toggle from "@/components/ui/Toggle";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Fast Food",
  "Pizza",
  "Sushi",
  "Burgers",
  "Salads",
  "Desserts",
  "Café",
  "Seafood",
  "Vegetarian",
  "Vegan",
  "Iranian",
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "Other",
];

const DAYS = [
  { key: "monday",    label: "Monday" },
  { key: "tuesday",   label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday",  label: "Thursday" },
  { key: "friday",    label: "Friday" },
  { key: "saturday",  label: "Saturday" },
  { key: "sunday",    label: "Sunday" },
] as const;

const DEFAULT_WORKING_HOURS = DAYS.reduce((acc, { key }) => {
  acc[key] = { open: "10:00", close: "20:00", isClosed: false };
  return acc;
}, {} as CreatePageFormValues["workingHours"] & object);

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideVariants = {
  enterFromRight: { x: "100%", opacity: 0 },
  enterFromLeft:  { x: "-100%", opacity: 0 },
  center:         { x: 0, opacity: 1 },
  exitToLeft:     { x: "-100%", opacity: 0 },
  exitToRight:    { x: "100%", opacity: 0 },
};

// ─── Component ────────────────────────────────────────────────────────────────

const CreatePageForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [tagInput, setTagInput] = useState("");
  const { createPage, isPending, isError, error } = useCreatePage();

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    mode: "onTouched",
    defaultValues: {
      tags:         [],
      workingHours: DEFAULT_WORKING_HOURS,
    },
  });

  const tags = watch("tags") ?? [];

  // ─── Navigation ───────────────────────────────────────────────────

  const goNext = async () => {
    let fields: (keyof CreatePageFormValues)[] = [];
    if (step === 1) fields = ["name", "category", "description"];

    const valid = await trigger(fields);
    if (!valid) return;

    setDirection("forward");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection("backward");
    setStep((s) => s - 1);
  };

  const handleCancel = () => navigate(-1);

  // ─── Tags ─────────────────────────────────────────────────────────

  const handleTagInput = useCallback((value: string) => {
    if (value.endsWith(",")) {
      const newTag = value.slice(0, -1).trim();
      if (newTag && !tags.includes(newTag)) {
        setValue("tags", [...tags, newTag]);
      }
      setTagInput("");
    } else {
      setTagInput(value);
    }
  }, [tags, setValue]);

  const removeTag = (tag: string) => {
    setValue("tags", tags.filter((t) => t !== tag));
  };

  // ─── Submit ───────────────────────────────────────────────────────

  const onSubmit = (data: CreatePageFormValues) => {
    // Add any remaining tag input
    const finalTags = tagInput.trim()
      ? [...(data.tags ?? []), tagInput.trim()]
      : data.tags;

    const payload = {
      ...data,
      tags: finalTags,
      // Clean empty optional strings
      ...(data.website   === "" && { website:   undefined }),
      ...(data.avatar    === "" && { avatar:    undefined }),
      ...(data.coverImage === "" && { coverImage: undefined }),
    };

    createPage(payload);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col min-h-screen bg-black px-5 pt-5 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={step === 1 ? handleCancel : goBack}
          className="flex items-center gap-1 text-white"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Create Page</span>
        </button>
        <button
          onClick={handleCancel}
          className="text-[#F7C12B] text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      {/* ── Step Indicator ── */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= s ? "bg-[#F7C12B]" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      {/* ── Error Alert ── */}
      <Alert
        visible={isError}
        type="error"
        message={error?.message ?? "Something went wrong."}
      />

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1">
        <AnimatePresence mode="wait" initial={false}>

          {/* ────────── Step 1 — Basic Info ────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={direction === "forward" ? slideVariants.enterFromRight : slideVariants.enterFromLeft}
              animate={slideVariants.center}
              exit={direction === "forward" ? slideVariants.exitToLeft : slideVariants.exitToRight}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1 mb-2">
                <h1 className="text-2xl font-bold text-white">Get started with a Page</h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Create a page for your restaurant and start reaching customers.
                </p>
              </div>

              <Input
                id="name"
                type="text"
                placeholder="Page name"
                error={errors.name}
                {...register("name")}
              />

              {/* Category Select */}
              <div className="flex flex-col gap-1">
                <select
                  {...register("category")}
                  className="w-full px-4 py-3 rounded-xl text-sm border border-zinc-700 bg-transparent text-white outline-none focus:border-[#F7C12B] focus:ring-2 focus:ring-[#F7C12B]/20 transition-colors duration-200"
                >
                  <option value="" className="bg-zinc-900">Page category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-400">{errors.category.message}</p>
                )}
              </div>

              <Input
                id="description"
                type="text"
                placeholder="Page Description"
                error={errors.description}
                {...register("description")}
              />

              <Button type="button" fullWidth onClick={goNext} className="mt-2">
                Next
              </Button>
            </motion.div>
          )}

          {/* ────────── Step 2 — Contact & Location ────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={direction === "forward" ? slideVariants.enterFromRight : slideVariants.enterFromLeft}
              animate={slideVariants.center}
              exit={direction === "forward" ? slideVariants.exitToLeft : slideVariants.exitToRight}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              <Input
                id="phone"
                type="tel"
                placeholder="Phone number"
                error={errors.phone}
                {...register("phone")}
              />

              <Input
                id="website"
                type="url"
                placeholder="Website"
                error={errors.website}
                {...register("website")}
              />

              <Input
                id="location.address"
                type="text"
                placeholder="Location"
                error={errors.location?.address}
                {...register("location.address")}
              />

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" fullWidth onClick={goBack}>
                  Back
                </Button>
                <Button type="button" fullWidth onClick={goNext}>
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* ────────── Step 3 — Media & Tags ────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={direction === "forward" ? slideVariants.enterFromRight : slideVariants.enterFromLeft}
              animate={slideVariants.center}
              exit={direction === "forward" ? slideVariants.exitToLeft : slideVariants.exitToRight}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-4"
            >
              <Input
                id="avatar"
                type="url"
                placeholder="Avatar URL"
                error={errors.avatar}
                {...register("avatar")}
              />

              <Input
                id="coverImage"
                type="url"
                placeholder="Cover Image URL"
                error={errors.coverImage}
                {...register("coverImage")}
              />

              {/* Tags Input */}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => handleTagInput(e.target.value)}
                  placeholder="Tags (separate with comma)"
                  className="w-full px-4 py-3 rounded-xl text-sm border border-zinc-700 bg-transparent text-white placeholder:text-zinc-500 outline-none focus:border-[#F7C12B] focus:ring-2 focus:ring-[#F7C12B]/20 transition-colors duration-200"
                />
                {/* Tag chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-800 text-white text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-zinc-400 hover:text-white ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" fullWidth onClick={goBack}>
                  Back
                </Button>
                <Button type="button" fullWidth onClick={goNext}>
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* ────────── Step 4 — Working Hours ────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={direction === "forward" ? slideVariants.enterFromRight : slideVariants.enterFromLeft}
              animate={slideVariants.center}
              exit={direction === "forward" ? slideVariants.exitToLeft : slideVariants.exitToRight}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-2xl font-bold text-white">Set Your Working Hours</h2>
                <p className="text-sm text-zinc-400">Configure your restaurant's opening hours</p>
              </div>

              <div className="flex flex-col gap-0">
                {DAYS.map(({ key, label }) => (
                  <Controller
                    key={key}
                    control={control}
                    name={`workingHours.${key}`}
                    render={({ field }) => {
                      const value = field.value ?? { open: "10:00", close: "20:00", isClosed: false };
                      return (
                        <div className="flex items-center gap-3 py-4 border-b border-zinc-800">
                          {/* Day Label */}
                          <span className="text-white font-semibold text-sm w-24 shrink-0">
                            {label}
                          </span>

                          {/* Open Time */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 text-xs">Open</span>
                            <input
                              type="time"
                              value={value.open}
                              disabled={value.isClosed}
                              onChange={(e) => field.onChange({ ...value, open: e.target.value })}
                              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#F7C12B] disabled:opacity-30 w-24"
                            />
                          </div>

                          {/* Close Time */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-400 text-xs">Close</span>
                            <input
                              type="time"
                              value={value.close}
                              disabled={value.isClosed}
                              onChange={(e) => field.onChange({ ...value, close: e.target.value })}
                              className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-[#F7C12B] disabled:opacity-30 w-24"
                            />
                          </div>

                          {/* Toggle */}
                          <Toggle
  checked={!value.isClosed}
  onChange={(isOpen) => field.onChange({ ...value, isClosed: !isOpen })}
/>
                        </div>
                      );
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <Button type="button" variant="outline" fullWidth onClick={goBack}>
                  Back
                </Button>
                <Button type="submit" fullWidth isLoading={isPending}>
                  Create Page
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  );
};

export default CreatePageForm;