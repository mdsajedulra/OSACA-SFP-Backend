"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFoodDistributionSchema = exports.CreateFoodDistributionSchema = exports.FoodDistributionSchema = void 0;
const zod_1 = require("zod");
// FoodItem এর জন্য sub-schema
const FoodItemSchema = zod_1.z.object({
    food: zod_1.z.string()
        .min(1, "Food name required")
        .trim()
        .max(100, "Food name too long"),
    sent: zod_1.z.number()
        .int("Must be whole number")
        .min(0, "Cannot be negative"),
    received: zod_1.z.number()
        .int("Must be whole number")
        .min(0, "Cannot be negative"),
});
// Main FoodDistribution Zod schema
exports.FoodDistributionSchema = zod_1.z.object({
    uuid: zod_1.z.string()
        .min(1)
        .uuid("Invalid UUID format") // অথবা .regex(/^[0-9a-f]{8}-.../) যদি custom uuid হয়
        .optional(), // create-এর সময় backend generate করবে
    schoolId: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid School ID"),
    upazilaId: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Upazila ID"),
    date: zod_1.z.string()
        .pipe(zod_1.z.coerce.date())
        .refine((d) => !isNaN(d.getTime()), "Invalid date")
        .refine((d) => d <= new Date(), "Future date not allowed"),
    days: zod_1.z.number()
        .int("Days must be whole number")
        .min(1, "At least 1 day")
        .max(31, "Maximum 31 days allowed"),
    items: zod_1.z.array(FoodItemSchema)
        .min(1, "At least one food item required")
        .max(20, "Too many items"),
    status: zod_1.z.enum(["draft", "submitted", "confirmed", "flagged"])
        .default("draft"),
    submittedBy: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
    confirmedBy: zod_1.z.string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid School ID")
        .optional() // confirmed না হলে null/undefined
        .nullable(),
    confirmedAt: zod_1.z.date().optional().nullable(),
    remark: zod_1.z.string()
        .trim()
        .max(500, "Remark too long")
        .optional(),
    // createdAt/updatedAt → mongoose timestamps handle করবে, তাই এখানে লাগবে না
});
// Create-এর জন্য (যেখানে uuid + confirmedBy দরকার নেই)
exports.CreateFoodDistributionSchema = exports.FoodDistributionSchema.omit({
    uuid: true,
    status: true,
    confirmedBy: true,
    confirmedAt: true,
}).extend({
    status: zod_1.z.literal("draft").optional(), // default draft
});
// Update/Submit-এর জন্য partial
exports.UpdateFoodDistributionSchema = exports.FoodDistributionSchema.partial().extend({
    _id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/),
});
