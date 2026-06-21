import { model, Schema } from "mongoose";

const counterSchema = new Schema<IChallan>({
  _id: { type: String }, // ← String type বললেই Mongoose allow করে
  seq: { type: Number, default: 0 },
});
export const Counter = model<IChallan>("Counter", counterSchema);
