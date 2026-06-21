import { ObjectId } from "mongodb";

export interface IUpazila {
  _id?: ObjectId;
  upazilaCode: string;
  upazilaName: string;
  concernedOfficerName: string;
  concernedOfficerNumber: string;
  concernedOfficerDesignation: string;
}
