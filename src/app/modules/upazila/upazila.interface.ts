import { ObjectId } from "mongodb";

export interface IUpazila {
  _id?: ObjectId;
  upazilaCode: string;
  upazilaName: string;
}
