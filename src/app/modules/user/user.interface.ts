export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "sa"| "admin"| "mo"| "bm";
  accessUpazila?: string; 
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface IOperator {
  userId: string;
  password: string;
  role: "operator";
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
