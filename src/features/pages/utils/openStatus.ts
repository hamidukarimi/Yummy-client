import type { WorkingHours, WorkingHoursDay } from "@/features/pages/types/page.types";

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export const getCurrentDayKey = (): keyof WorkingHours =>
  DAY_KEYS[new Date().getDay()] ?? "sunday";

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
};

export const formatTime = (time: string): string => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${minutes.toString().padStart(2, "0")} ${period}`;
};

export const getOpenStatus = (workingHours: WorkingHours) => {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const today = workingHours[getCurrentDayKey()];
  const yesterday =
    workingHours[DAY_KEYS[(now.getDay() + 6) % 7] ?? "sunday"];

  const overnightFromYesterday =
    yesterday &&
    !yesterday.isClosed &&
    toMinutes(yesterday.close) < toMinutes(yesterday.open) &&
    current < toMinutes(yesterday.close);

  if (overnightFromYesterday) {
    return {
      isOpen: true,
      label: `Open now · Closes ${formatTime(yesterday.close)}`,
    };
  }

  if (!today || today.isClosed) {
    return { isOpen: false, label: "Closed today" };
  }

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);

  if (close > open && current >= open && current < close) {
    return { isOpen: true, label: `Open now · Closes ${formatTime(today.close)}` };
  }

  if (close < open && current >= open) {
    return { isOpen: true, label: `Open now · Closes ${formatTime(today.close)}` };
  }

  if (current < open) {
    return { isOpen: false, label: `Opens at ${formatTime(today.open)}` };
  }

  return { isOpen: false, label: "Closed now" };
};

export type { WorkingHoursDay };
