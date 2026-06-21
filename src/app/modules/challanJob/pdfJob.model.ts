import mongoose, { Schema } from "mongoose";

const challanJobSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    pdfPath: { type: String, required: false },
    error: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("pdfJob", challanJobSchema);
