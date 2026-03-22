import { ObjectId, Schema } from "mongoose";

export type Role = "admin" | "upazilaManager" | "teacher";

export interface IFoodItem {
  food: string;
  sent: number;
  received: number;
}

export type DistributionStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "flagged";

export interface IFoodDistribution {
  _id?: ObjectId;

  uuid: string; // unique

  schoolId: ObjectId;
  

  date: Date;
  days: number;

  items: IFoodItem[];

  status: DistributionStatus;

  submittedBy: ObjectId;

  confirmedBy?: ObjectId;
  confirmedAt?: Date;

  remark?: string;

  createdAt?: Date;
  updatedAt?: Date;
}