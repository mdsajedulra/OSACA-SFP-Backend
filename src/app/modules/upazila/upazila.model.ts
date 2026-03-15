import mongoose, { Schema } from "mongoose";
import { IUpazila } from "./upazila.interface";

const UpazilaSchema: Schema = new Schema(
  {
    upazilaCode : {
      type: String,
      required: true,
      unique: true,
    },

    upazilaName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Upazila = mongoose.model<IUpazila>("Upazila", UpazilaSchema);
