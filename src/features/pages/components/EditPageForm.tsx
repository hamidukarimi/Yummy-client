import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Pencil, X } from "lucide-react";
// import { Controller, useForm } from "react-hook-form";
import usePage from "@/features/pages/hooks/usePage";
import useEditPage from "@/features/pages/hooks/useEditPage";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import type { ApiPage, WorkingHours } from "@/features/pages/types/page.types";
import { PAGE_CATEGORIES } from "@/features/pages/constants/pageCategories";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: "monday",    label: "Monday"    },
  { key: "tuesday",   label: "Tuesday"   },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday",  label: "Thursday"  },
  { key: "friday",    label: "Friday"    },
  { key: "saturday",  label: "Saturday"  },
  { key: "sunday",    label: "Sunday"    },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditPageFormProps {
  slug: string;
}

interface InnerFormProps {
  page:      ApiPage;
  slug:      string;
  onSuccess: () => void;
}

// ─── Inner Form ───────────────────────────────────────────────────────────────

const InnerForm = ({ page, slug, onSuccess }: InnerFormProps) => {
  const navigate = useNavigate();
  const { editPage, isPending, error, isSuccess } = useEditPage(slug);

  // ─── Form State ───────────────────────────────────────────────────────────
  const [name,        setName]        = useState(page.name ?? "");
  const [category,    setCategory]    = useState(page.category ?? "");
  const [description, setDescription] = useState(page.description ?? "");
  const [avatar,      setAvatar]      = useState(page.avatar ?? "");
  const [coverImage,  setCoverImage]  = useState(page.coverImage ?? "");
  const [phone,       setPhone]       = useState(page.phone ?? "");
  const [website,     setWebsite]     = useState(page.website ?? "");
  const [location,    setLocation]    = useState(
    [page.location?.city, page.location?.country].filter(Boolean).join(", ") ?? ""
  );
  const [latitude, setLatitude] = useState(
    page.location?.coordinates?.lat?.toString() ?? "",
  );
  const [longitude, setLongitude] = useState(
    page.location?.coordinates?.lng?.toString() ?? "",
  );
  const [coordError, setCoordError] = useState("");
  const [tagInput,    setTagInput]    = useState("");
  const [tags,        setTags]        = useState<string[]>(page.tags ?? []);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(
    page.workingHours ?? {
      monday:    { open: "09:00", close: "22:00", isClosed: false },
      tuesday:   { open: "09:00", close: "22:00", isClosed: false },
      wednesday: { open: "09:00", close: "22:00", isClosed: false },
      thursday:  { open: "09:00", close: "22:00", isClosed: false },
      friday:    { open: "09:00", close: "22:00", isClosed: false },
      saturday:  { open: "10:00", close: "23:00", isClosed: false },
      sunday:    { open: "00:00", close: "00:00", isClosed: true  },
    }
  );

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => onSuccess(), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,$/, "");
      if (trimmed && !tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const updateDay = (
    day: keyof WorkingHours,
    field: "open" | "close" | "isClosed",
    value: string | boolean,
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    // Parse location string back to object
    const locationParts = location.split(",").map((s) => s.trim());
    const lat = latitude.trim() === "" ? undefined : Number(latitude);
    const lng = longitude.trim() === "" ? undefined : Number(longitude);
    if ((latitude.trim() === "") !== (longitude.trim() === "")) {
      setCoordError("Enter both latitude and longitude");
      return;
    }
    if (
      (lat !== undefined && Number.isNaN(lat)) ||
      (lng !== undefined && Number.isNaN(lng)) ||
      (lat !== undefined && (lat < -90 || lat > 90)) ||
      (lng !== undefined && (lng < -180 || lng > 180))
    ) {
      setCoordError("Enter valid coordinates");
      return;
    }
    setCoordError("");
    const coordinates =
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined;

    editPage({
      name:        name.trim(),
      category,
      ...(description.trim() && { description: description.trim() }),
      ...(avatar.trim()      && { avatar:      avatar.trim()      }),
      ...(coverImage.trim()  && { coverImage:  coverImage.trim()  }),
      ...(phone.trim()       && { phone:       phone.trim()       }),
      ...(website.trim()     && { website:     website.trim()     }),
      ...(tags.length > 0    && { tags }),
      ...((location.trim() || coordinates || page.location?.address) && {
        location: {
          ...(page.location?.address && { address: page.location.address }),
          ...(locationParts[0] && { city: locationParts[0] }),
          ...(locationParts[1] && { country: locationParts[1] }),
          ...(coordinates && { coordinates }),
        },
      }),
      workingHours,
    });
  };

  // ─── Input class ──────────────────────────────────────────────────────────
  const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700";
  const labelClass = "text-zinc-400 text-sm font-medium";

  return (
    <div className="min-h-screen bg-black pb-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-white"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Edit Page</span>
        </motion.button>

        <button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          className="text-[#F7C12B] font-semibold text-sm disabled:opacity-40"
        >
          Save
        </button>
      </div>

      {/* ── Cover + Avatar Preview ── */}
      <div className="relative w-full h-44 mb-14">
        {/* Cover */}
        <div className="w-full h-full bg-zinc-900 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
        </div>

        {/* Cover edit icon */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
          <Pencil size={14} className="text-white" />
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="relative w-20 h-20">
            <div className="w-20 h-20 rounded-full border-4 border-black bg-zinc-800 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xl font-bold text-white">
                  {page.name[0]}
                </div>
              )}
            </div>
            {/* Avatar edit icon */}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center">
              <Pencil size={10} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5 max-w-md mx-auto">

        {/* ── Alerts ── */}
        {coordError && <Alert variant="error" message={coordError} />}
        {error    && <Alert variant="error"   message={error.message} />}
        {isSuccess && <Alert variant="success" message="Page updated successfully!" />}

        {/* ── Profile Image URL ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Profile Image URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/image/837463"
            className={inputClass}
          />
        </div>

        {/* ── Cover Image URL ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image/837463"
            className={inputClass}
          />
        </div>

        {/* ── Page Name ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Page Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Barg Restaurant"
            className={inputClass}
          />
        </div>

        {/* ── Category ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Page category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputClass} appearance-none`}
          >
            {PAGE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-zinc-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* ── Description ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Page description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Lorem ipsum dolor sit amet..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* ── Tags ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Tags</label>
          <div className={`${inputClass} flex flex-wrap gap-2 min-h-[48px] cursor-text`}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-white">
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "comma separated" : ""}
              className="bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none min-w-[100px] flex-1"
            />
          </div>
        </div>

        {/* ── Phone ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0000372342"
            className={inputClass}
          />
        </div>

        {/* ── Website ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://myweb.com"
            className={inputClass}
          />
        </div>

        {/* ── Location ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Amsterdam, Netherlands"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="34.5553"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="69.2075"
              className={inputClass}
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-zinc-900 my-2" />

        {/* ── Working Hours ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-white font-bold text-lg">Set Your Working Hours</h2>
            <p className="text-zinc-500 text-sm">Configure your restaurant's opening hours</p>
          </div>

          <div className="flex flex-col divide-y divide-zinc-900">
            {DAYS.map(({ key, label }) => {
              const day = workingHours[key];
              return (
                <div key={key} className="flex items-center gap-3 py-4">
                  {/* Day label */}
                  <span className="text-white font-bold text-sm w-24 shrink-0">
                    {label}
                  </span>

                  {/* Open time */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-zinc-500 text-xs">Open</span>
                    <input
                      type="time"
                      value={day.open}
                      disabled={day.isClosed}
                      onChange={(e) => updateDay(key, "open", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Close time */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-zinc-500 text-xs">Close</span>
                    <input
                      type="time"
                      value={day.close}
                      disabled={day.isClosed}
                      onChange={(e) => updateDay(key, "close", e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Toggle */}
                  <Toggle
                    checked={!day.isClosed}
                    onChange={(isOpen) => updateDay(key, "isClosed", !isOpen)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            fullWidth
            isLoading={isPending}
            disabled={!name.trim()}
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
          <p className="text-zinc-600 text-xs text-center">
            Changes will be visible to your followers immediately.
          </p>
        </div>

      </div>
    </div>
  );
};

// ─── Outer Component ──────────────────────────────────────────────────────────

const EditPageForm = ({ slug }: EditPageFormProps) => {
  const navigate                     = useNavigate();
  const { data, isLoading, isError } = usePage(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Page not found.</p>
      </div>
    );
  }

  return (
    <InnerForm
      page={data.page}
      slug={slug}
      onSuccess={() => navigate(`/pages/${slug}`)}
    />
  );
};

export default EditPageForm;