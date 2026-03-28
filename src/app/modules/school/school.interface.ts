import { Types } from "mongoose";

export interface IAddress {
  upazilaId: Types.ObjectId;
  union: string;
  district: string;
}

export interface ISchool  {
  schoolName: string;
  schoolNameBangla: string;
  schoolCode: string;
  password: string;

  headTeacherPhoneNumber: string;
  headTeacherName: string;

  tifinManager?: string;
  tifinManagerPNumber?: string;


  totalStudent: number;

  address: IAddress;



  numberOfStudent: number;
  defaultItems: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISchoolLogin {
  schoolCode: string;
  password: string;
}