import mongoose, { Schema } from "mongoose";
import {
  IEggAttendance,
  IComment,
  IBananaAttendance,
  IBanrutiAttendance,
  IAttendance,
} from "./attendance.interface";

const AttendanceSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
challan: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },

    banana: {
      count: Number,
      submittedAt: Date,
    },

    banruti: {
      count: Number,
      submittedAt: Date,
    },

    egg: {
      count: Number,
      submittedAt: Date,
    },
    
  },
  {
    timestamps: true,
  },
);


















const BananaAttendanceSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    banana: { type: Number, required: true },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const BanrutiAttendanceSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    banruti: { type: Number, required: true },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const EggAttendanceSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    egg: { type: Number, required: true },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

const CommentSchema: Schema = new Schema(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    comment: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);


export const Attendance = mongoose.model<IAttendance>("Attendance", AttendanceSchema);


const BananaAttendance = mongoose.model<IBananaAttendance>(
  "BananaAttendance",
  BananaAttendanceSchema,
);
const banrutiAttendance = mongoose.model<IBanrutiAttendance>(
  "BanrutiAttendance",
  BanrutiAttendanceSchema,
);
const eggAttendance = mongoose.model<IEggAttendance>(
  "EggAttendance",
  EggAttendanceSchema,
);
const commentModel = mongoose.model<IComment>("Comment", CommentSchema);

export const attendanceModel = {
  BananaAttendance,
  banrutiAttendance,
  eggAttendance,
  commentModel,
};
