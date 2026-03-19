import { z } from "zod";
import { ObjectId } from "mongoose"; // optional, শুধু type হিসেবে

// FoodItem এর জন্য sub-schema
const FoodItemSchema = z.object({
  food: z.string()
    .min(1, "Food name required")
    .trim()
    .max(100, "Food name too long"),

  sent: z.number()
    .int("Must be whole number")
    .min(0, "Cannot be negative"),

  received: z.number()
    .int("Must be whole number")
    .min(0, "Cannot be negative"),
});

// Main FoodDistribution Zod schema
export const FoodDistributionSchema = z.object({
  uuid: z.string()
    .min(1)
    .uuid("Invalid UUID format") // অথবা .regex(/^[0-9a-f]{8}-.../) যদি custom uuid হয়
    .optional(), // create-এর সময় backend generate করবে

  schoolId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid School ID"),

  upazilaId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid Upazila ID"),

  date: z.string()
    .pipe(z.coerce.date())
    .refine((d) => !isNaN(d.getTime()), "Invalid date")
    .refine((d) => d <= new Date(), "Future date not allowed"),

  days: z.number()
    .int("Days must be whole number")
    .min(1, "At least 1 day")
    .max(31, "Maximum 31 days allowed"),

  items: z.array(FoodItemSchema)
    .min(1, "At least one food item required")
    .max(20, "Too many items"),

  status: z.enum(["draft", "submitted", "confirmed", "flagged"])
    .default("draft"),

  submittedBy: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),

  confirmedBy: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid School ID")
    .optional() // confirmed না হলে null/undefined

    .nullable(),

  confirmedAt: z.date().optional().nullable(),

  remark: z.string()
    .trim()
    .max(500, "Remark too long")
    .optional(),

  // createdAt/updatedAt → mongoose timestamps handle করবে, তাই এখানে লাগবে না
});

// Create-এর জন্য (যেখানে uuid + confirmedBy দরকার নেই)
export const CreateFoodDistributionSchema = FoodDistributionSchema.omit({
  uuid: true,
  status: true,
  confirmedBy: true,
  confirmedAt: true,
}).extend({
  status: z.literal("draft").optional(), // default draft
});

// Update/Submit-এর জন্য partial
export const UpdateFoodDistributionSchema = FoodDistributionSchema.partial().extend({
  _id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});