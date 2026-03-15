/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from "mongoose";

import bcrypt from "bcryptjs";
import { IOperator, IUser } from "./user.interface";

// user registratin schema
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    accessUpazila: { type: String, required: false },
    role: {
      type: String,
      enum: ["sa", "admin", "mo", "bm"], // sa= super admin, admin, mo= monitoring Officer, bm = branch Manager
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OperatorSchema = new Schema(
  {
    userId: { type: String, required: true },

    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["operator"],
    },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// password hash pre hook
UserSchema.pre("save", async function (next) {
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(process.env.bcrypt_salt_rounds)
  );
  next();
});

// return document password empty string define
UserSchema.post("save", function (doc, next) {
  doc.password = "";
  next();
});

// export model
export const User = mongoose.model<IUser>("User", UserSchema);
export const Operator = mongoose.model<IOperator>("Operator", OperatorSchema);
