/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { TErrorSources, TGenericErrorResponse } from "../interface/error";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
  const keyValue = err?.keyValue || {};

  const path = Object.keys(keyValue)[0] || "";
  const value = Object.values(keyValue)[0] || "";

  const errorSources: TErrorSources = [
    {
      path,
      message: value ? `${value} already exists` : "Duplicate value already exists",
    },
  ];

  return {
    statusCode: StatusCodes.CONFLICT,
    message: "Duplicate Field Error",
    errorSources,
  };
};