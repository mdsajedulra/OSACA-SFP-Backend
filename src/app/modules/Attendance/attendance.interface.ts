import { Types } from "mongoose";

interface IFoodItem {
  count?: number;
  submittedAt?: Date;
}

export interface IAttendance {
  _id?: Types.ObjectId;
challan: string;
  schoolId: Types.ObjectId;

  date: Date;

  banana?: IFoodItem;

  banruti?: IFoodItem;

  egg?: IFoodItem;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface IBananaAttendance {
  schoolId: string;
  banana: number;
  timestamp?: Date;
}
export interface IBanrutiAttendance {
  schoolId: string;
  banruti: number;
  timestamp?: Date;
}
export interface IEggAttendance {
  schoolId: string;
  egg: number;
  timestamp?: Date;
}
export interface IComment {
  schoolId: string;
  comment: string;
  isRead: boolean;
  timestamp?: Date;
}
