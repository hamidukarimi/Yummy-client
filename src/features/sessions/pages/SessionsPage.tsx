import { ChevronLeft, Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Alert from "@/components/ui/Alert";
import Spinner from "@/components/ui/Spinner";
import useSessions from "@/features/sessions/hooks/useSessions";

const getDeviceLabel = (userAgent?: string): {
  label: string;
  mobile: boolean;
} => {
  if (!userAgent) return { label: "Unknown device", mobile: false };

  const mobile = /Android|iPhone|iPad|Mobile/i.test(userAgent);
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const platform = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Unknown OS";

  return { label: `${browser} on ${platform}`, mobile };
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const SessionsPage = () => {
  const navigate = useNavigate();
  const {
    sessions,
    isLoading,
    isError,
    revokeSession,
    revokingSessionId,
    revokeError,
    logoutOtherDevices,
    isLoggingOutOthers,
    logoutOthersError,
    revokedCount,
  } = useSessions();

  const otherSessionCount = sessions.filter(
    (session) => !session.isCurrent,
  ).length;
  const mutationError = revokeError ?? logoutOthersError;

  return (
    <div className="min-h-screen bg-black px-4 pt-5 pb-24">
      <div className="max-w-2xl mx-auto flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-zinc-900 cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Active sessions</h1>
            <p className="text-xs text-zinc-500">
              Review devices signed in to your account.
            </p>
          </div>
        </div>

        {mutationError && (
          <Alert variant="error" message={mutationError.message} />
        )}
        {revokedCount !== undefined && (
          <Alert
            variant="success"
            message={`${revokedCount} other ${
              revokedCount === 1 ? "device" : "devices"
            } logged out.`}
          />
        )}

        {isLoading && (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <p className="text-zinc-500 text-sm text-center py-12">
            Failed to load active sessions.
          </p>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const device = getDeviceLabel(session.userAgent);
                const DeviceIcon = device.mobile ? Smartphone : Laptop;

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 flex gap-3"
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#F7C12B] shrink-0">
                      <DeviceIcon size={21} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">
                          {device.label}
                        </p>
                        {session.isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[11px] text-green-400">
                            <ShieldCheck size={11} />
                            Current device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        IP: {session.ip ?? "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Last active {formatDate(session.updatedAt)}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Expires {formatDate(session.expiresAt)}
                      </p>
                    </div>

                    {!session.isCurrent && (
                      <button
                        type="button"
                        onClick={() => revokeSession(session.id)}
                        disabled={revokingSessionId === session.id}
                        className="self-center inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-40 cursor-pointer"
                      >
                        <LogOut size={15} />
                        {revokingSessionId === session.id
                          ? "Logging out..."
                          : "Log out"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {sessions.length === 0 && (
              <p className="text-zinc-500 text-sm text-center py-12">
                No active sessions found.
              </p>
            )}

            {otherSessionCount > 0 && (
              <button
                type="button"
                onClick={() => logoutOtherDevices()}
                disabled={isLoggingOutOthers}
                className="w-full rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-40 cursor-pointer"
              >
                {isLoggingOutOthers
                  ? "Logging out other devices..."
                  : `Log out ${otherSessionCount} other ${
                      otherSessionCount === 1 ? "device" : "devices"
                    }`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionsPage;
