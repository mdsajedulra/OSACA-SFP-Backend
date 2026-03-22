import {  Types } from "mongoose";

export interface IAddress {
  upazilaId: Types.ObjectId;
  union: string;
  district: string;
}

export interface ISchool extends Document {
  schoolName: string;
  schoolCode: string;
  password: string;
  concernMobileNumber: string;
  concernName: string;
  totalTeacher: number;
  totalStudent: number;
  address: IAddress;
  defaultItems: number;
  showDetails: string;
}

interface ISchoolLogin {
  schoolCode: string;
  password: string;
}
export { ISchoolLogin };
