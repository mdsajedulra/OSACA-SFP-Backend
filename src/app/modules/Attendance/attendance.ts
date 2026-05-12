// export interface IAddress {
//   village: string;
//   union: string;
//   upozila: string;
//   district: string;
// }
// export interface ISchool {
//   _id: string;
//   schoolName: string;
//   schoolCode: string;
//   password?: string;
//   concernMobileNumber?: string;
//   totalEmployees?: number;
//   address: IAddress;
//   createdAt: string;
//   updatedAt: string;
//   __v?: number;
// }
// export interface IAttendanceItem {
//   _id: string;
//   schoolId: ISchool;     // populated school object
//   egg?: number;    // when type = egg
//   banruti?: number;     // when type = banruti
//   banana?: number;   // when type = banana
//   createdAt: string;
//   updatedAt: string;
//   __v?: number;
//   type: "banana" | "banruti" | "egg";
//   count: number;     // total count
//   recordId: string;  // attendance record _id
// }
//  export interface IGroupedAttendance {
//   date: string;  // e.g. "2025-11-24"
//   schoolId: string;
//   schoolName: string;
//   schoolCode: string;
//   concernMobileNumber?: string;

//   address: IAddress;

//   banana: number;
//   banruti: number;
//   egg: number;

//   schoolDetails: ISchool;

//   attendanceIds: string[];
// }
