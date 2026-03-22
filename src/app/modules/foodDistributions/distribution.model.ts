import mongoose, { Schema } from "mongoose";
import { IFoodDistribution } from "./distribution.interface";

const FoodItemSchema = new Schema(
    {
        food: {
            type: String,
            required: true,
            trim: true

        },
        sent: {
            type: Number,
            required: true,
            min: 0,
        },
        received: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }

)

// Main schema for food distribution 

const FoodDistributionSchema = new Schema<IFoodDistribution>(
    {

        uuid: {
            type: String,
            required: true,
            unique: true,
            index: true,

        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: "School",
            required: true,
        },
        upazilaId: {
            type: Schema.Types.ObjectId,
            ref: "Upazila",
            required: true,
        },
      
        date: {
            type: Date,
            required: true,
        },
        days: {
            type: Number,
            required: true,
            min: 1,
        },
        items: [FoodItemSchema],
        status: {
            type: String,
            enum: ["draft", "submitted", "confirmed", "flagged"],
            default: "draft",
            index: true,
        },
        submittedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        confirmedBy: {
            type: Schema.Types.ObjectId,
            ref: "School",
            required: false,
        },

        confirmedAt: Date,
        remark: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }

)
FoodDistributionSchema.index(
    { schoolId: 1, date: 1 },
    { unique: true }
);

export const FoodDistribution = mongoose.model<IFoodDistribution>("FoodDistribution", FoodDistributionSchema);