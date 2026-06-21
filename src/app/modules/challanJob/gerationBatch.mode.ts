// models/generationBatch.model.ts

import mongoose, { Schema } from "mongoose";

const generationBatchSchema = new Schema(
  {
    name: { type: String, required: true },
    selectedDates: [{ type: Date }],

    totalSchools: { type: Number, default: 0 },
    totalDistributions: { type: Number, default: 0 },
    totalChallans: { type: Number, default: 0 },

    challanRange: {
      from: { type: String }, // "000001"
      to: { type: String }, // "004992"
    },

    status: {
      type: String,
      enum: ["processing", "done", "zip_generating", "zip_ready", "failed"],
      default: "processing",
    },

    zipPath: { type: String }, // PDF ready হলে path এখানে
    zipGeneratedAt: { type: Date },

    generatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export  const generationBatchModel =  mongoose.model("GenerationBatch", generationBatchSchema);
