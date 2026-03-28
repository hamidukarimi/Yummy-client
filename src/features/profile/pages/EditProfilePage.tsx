import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, UserCircle } from "lucide-react";
import useProfile from "@/features/profile/hooks/useProfile";
import useUpdateProfile from "@/features/profile/hooks/useUpdateProfile";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import type { ApiUser } from "@/types/api.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InnerFormProps {
  user:      ApiUser;
  onSuccess: () => void;
}

// ─── Inner Form ───────────────────────────────────────────────────────────────

const InnerForm = ({ user, onSuccess }: InnerFormProps) => {
  const navigate = useNavigate();
  const { updateProfile, isPending, error, isSuccess } = useUpdateProfile();

  const [firstname, setFirstname] = useState(user.firstname);
  const [lastname,  setLastname]  = useState(user.lastname);
  const [username,  setUsername]  = useState(user.username);
  const [avatar,    setAvatar]    = useState(user.avatar ?? "");
  const [birthday,  setBirthday]  = useState(
    user.birthday ? new Date(user.birthday).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState<"male" | "female" | "other" | "">(
    user.gender ?? ""
  );

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => onSuccess(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  const handleSubmit = () => {
    updateProfile({
      ...(firstname !== user.firstname && { firstname }),
      ...(lastname  !== user.lastname  && { lastname  }),
      ...(username  !== user.username  && { username  }),
      ...(avatar    !== (user.avatar ?? "") && avatar.trim() && { avatar }),
      ...(birthday  && { birthday }),
      ...(gender    && { gender }),
    });
  };

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
          <span className="text-sm font-medium">Edit Profile</span>
        </motion.button>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="text-[#F7C12B] font-semibold text-sm disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="px-4 flex flex-col gap-5 max-w-md mx-auto">

        {/* ── Alerts ── */}
        {error     && <Alert variant="error"   message={error.message} />}
        {isSuccess && <Alert variant="success" message="Profile updated!" />}

        {/* ── Avatar Preview ── */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserCircle size={48} className="text-zinc-500" />
              </div>
            )}
          </div>
          <p className="text-zinc-500 text-xs">Enter a URL below to update your photo</p>
        </div>

        {/* ── Avatar URL ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Profile Photo URL</label>
          <input
            type="url"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className={inputClass}
          />
        </div>

        {/* ── First Name ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>First Name</label>
          <input
            type="text"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="First name"
            className={inputClass}
          />
        </div>

        {/* ── Last Name ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Last Name</label>
          <input
            type="text"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Last name"
            className={inputClass}
          />
        </div>

        {/* ── Username ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Username</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className={`${inputClass} pl-8`}
            />
          </div>
        </div>

        {/* ── Birthday ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={`${inputClass} text-zinc-400`}
          />
        </div>

        {/* ── Gender ── */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Gender</label>
          <div className="flex gap-2">
            {(["male", "female", "other"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium border capitalize transition-colors duration-200 ${
                  gender === g
                    ? "bg-[#F7C12B] border-[#F7C12B] text-black"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="pt-2">
          <Button fullWidth isLoading={isPending} onClick={handleSubmit}>
            Save Changes
          </Button>
        </div>

        {/* ── Security ── */}
        <div className="pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => navigate("/profile/change-password")}
            className="w-full py-3 rounded-xl text-sm font-semibold text-[#F7C12B] border border-zinc-700 hover:bg-zinc-900 transition-colors"
          >
            Change password
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── Outer Component ──────────────────────────────────────────────────────────

const EditProfilePage = () => {
  const navigate                     = useNavigate();
  const { user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <InnerForm
      user={user}
      onSuccess={() => navigate("/profile")}
    />
  );
};

export default EditProfilePage;