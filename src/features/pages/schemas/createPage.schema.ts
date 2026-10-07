import { z } from "zod";

// ─── Working Hours ────────────────────────────────────────────────────────────

const workingHoursDaySchema = z.object({
  open:     z.string(),
  close:    z.string(),
  isClosed: z.boolean(),
});

const workingHoursSchema = z.object({
  monday:    workingHoursDaySchema,
  tuesday:   workingHoursDaySchema,
  wednesday: workingHoursDaySchema,
  thursday:  workingHoursDaySchema,
  friday:    workingHoursDaySchema,
  saturday:  workingHoursDaySchema,
  sunday:    workingHoursDaySchema,
});

// ─── Schema ───────────────────────────────────────────────────────────────────

export const createPageSchema = z.object({
  name: z
    .string()
    .min(2, "Page name must be at least 2 characters")
    .max(100, "Page name must be at most 100 characters"),

  category: z
    .string()
    .min(1, "Please select a category"),

  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),

  phone:   z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),

  location: z.object({
    address: z.string().optional(),
    city:    z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }).optional(),
  }).optional().refine(
    (location) => {
      const lat = location?.coordinates?.lat;
      const lng = location?.coordinates?.lng;
      return (lat === undefined) === (lng === undefined);
    },
    { message: "Latitude and longitude are both required" },
  ),

  avatar:     z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),

  tags: z.array(z.string()).optional(),

  workingHours: workingHoursSchema.optional(),
});

export type CreatePageFormValues = z.infer<typeof createPageSchema>;