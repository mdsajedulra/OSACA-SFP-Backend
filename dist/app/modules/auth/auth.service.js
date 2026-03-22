"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const user_model_1 = require("../user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const register = (payload) => {
    const result = user_model_1.User.create(payload);
    return result;
};
const login = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: payload.email }).select("+password");
    if (!user) {
        throw new Error("User Not Found");
    }
    const userStatus = user === null || user === void 0 ? void 0 : user.isBlocked;
    if (userStatus) {
        throw new Error("User is Blocked");
    }
    const isPasswordMatch = yield bcryptjs_1.default.compare(payload.password, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid Password");
    }
    const token = jsonwebtoken_1.default.sign({ email: user === null || user === void 0 ? void 0 : user.email, role: user === null || user === void 0 ? void 0 : user.role }, "secret", {
        expiresIn: "1d",
    });
    const verifiedUser = {
        _id: user === null || user === void 0 ? void 0 : user._id,
        name: user === null || user === void 0 ? void 0 : user.name,
        email: user === null || user === void 0 ? void 0 : user.email,
        role: user === null || user === void 0 ? void 0 : user.role,
    };
    return { token, email: user === null || user === void 0 ? void 0 : user.email, verifiedUser };
});
//change password
const changePassword = (userData, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the user is exist
    // console.log(userData);
    const user = yield user_model_1.User.findOne({ email: userData.email }).select("+password");
    if (!user) {
        throw new Error("This user is not found !");
    }
    // checking if the user is blocked
    const userStatus = user === null || user === void 0 ? void 0 : user.isBlocked;
    // console.log(userStatus);
    if (userStatus === true) {
        throw new Error("This user is blocked ! !");
    }
    // console.log(user);
    // checking if the password is correct
    const isPasswordMatch = yield bcryptjs_1.default.compare(payload.oldPassword, user === null || user === void 0 ? void 0 : user.password);
    console.log("password match", isPasswordMatch);
    if (!isPasswordMatch)
        throw new Error("Password do not matched");
    //hash new password
    const newHashedPassword = yield bcryptjs_1.default.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    console.log(newHashedPassword);
    const updateP = yield user_model_1.User.findOneAndUpdate({
        email: userData.email,
        role: userData.role,
    }, {
        password: newHashedPassword,
    });
    return updateP;
});
// const changePassword = async (
//   userData: JwtPayload,
//   payload: { oldPassword: string; newPassword: string },
// ) => {
//   // checking if the user is exist
//   const user = await User.findOne({email: userData.email})
//   console.log(user?.isBlocked);
//   // return null;
// };
exports.authService = {
    register,
    login,
    changePassword,
};
