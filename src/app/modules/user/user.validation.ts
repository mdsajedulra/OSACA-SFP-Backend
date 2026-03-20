import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "upazilaManager", "teacher"]),
  isBlocked: z.boolean().default(false),
});
const OperatorSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required").default("operator"),
  isBlocked: z.boolean().default(false),
});

export const userValidation = {
  UserSchema,
  OperatorSchema,
};
