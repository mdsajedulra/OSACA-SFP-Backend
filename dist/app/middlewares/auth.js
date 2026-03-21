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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const user_model_1 = require("../modules/user/user.model");
const auth = (...requiredRole) => (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authorization = req.headers.authorization;
    console.log(authorization === null || authorization === void 0 ? void 0 : authorization.split(" "));
    if (!authorization) {
        throw new Error('Authorization Required');
    }
    const [Bearer, token] = authorization.split(' ');
    if (Bearer !== 'Bearer' || !token) {
        throw new Error('You are not Authorized!');
    }
    const decoded = jsonwebtoken_1.default.verify(token, 'secret');
    const { email, role } = decoded;
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    if (requiredRole && !requiredRole.includes(role)) {
        throw new Error('you are not Authorized');
    }
    req.user = decoded;
    // console.log("nosto token", token);
    next();
}));
exports.default = auth;
