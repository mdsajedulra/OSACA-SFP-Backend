"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodDistribution = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FoodItemSchema = new mongoose_1.Schema({
    food: {
        type: String,
        required: true,
        trim: true,
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
    challanNo: {
        type: Number,
        required: true,
        unique: true,
        index: true,
    },
}, { _id: false });
// Main schema for food distribution
const FoodDistributionSchema = new mongoose_1.Schema({
    // challan: {
    //     type: String,
    //     required: false,
    //     // unique: true,
    //     // index: true,
    // },
    schoolId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "School",
        required: true,
    },
    upazilaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Upazila",
        required: true,
    },
    batchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "GenerationBatch",
        required: false,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    confirmedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "School",
        required: false,
    },
    confirmedAt: Date,
    remark: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
FoodDistributionSchema.index({ schoolId: 1, date: 1 }, { unique: true });
exports.FoodDistribution = mongoose_1.default.model("FoodDistribution", FoodDistributionSchema);
