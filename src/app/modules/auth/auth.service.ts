import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { ILoginUser } from "./auth.interface";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../config";

const register = (payload: IUser) => {
  const result = User.create(payload);
  return result;
};

const login = async (payload: ILoginUser) => {
  const user = await User.findOne({ email: payload.email }).select("+password");
  if (!user) {
    throw new Error("User Not Found");
  }
  const userStatus = user?.isBlocked;
  if (userStatus) {
    throw new Error("User is Blocked");
  }
  const isPasswordMatch = await bcrypt.compare(
    payload.password,
    user?.password
  );

  if (!isPasswordMatch) {
    throw new Error("Invalid Password");
  }
  const token = jwt.sign({ email: user?.email, role: user?.role }, "secret", {
    expiresIn: "1d",
  });
  const verifiedUser = {
    _id: user?._id,
    name: user?.name,
    email: user?.email,
    role: user?.role,
  };
  return { token, email: user?.email, verifiedUser };
};

//change password

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user is exist
  // console.log(userData);

  const user = await User.findOne({ email: userData.email }).select(
    "+password"
  );

  if (!user) {
    throw new Error("This user is not found !");
  }

  // checking if the user is blocked

  const userStatus = user?.isBlocked;
  // console.log(userStatus);

  if (userStatus === true) {
    throw new Error("This user is blocked ! !");
  }

  // console.log(user);

  // checking if the password is correct
  const isPasswordMatch = await bcrypt.compare(
    payload.oldPassword,
    user?.password
  );

  console.log("password match", isPasswordMatch);
  if (!isPasswordMatch) throw new Error("Password do not matched");

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  console.log(newHashedPassword);

  const updateP = await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
    }
  );

  return updateP;
};

// const changePassword = async (
//   userData: JwtPayload,
//   payload: { oldPassword: string; newPassword: string },
// ) => {
//   // checking if the user is exist
//   const user = await User.findOne({email: userData.email})
//   console.log(user?.isBlocked);

//   // return null;
// };

export const authService = {
  register,
  login,
  changePassword,
};
