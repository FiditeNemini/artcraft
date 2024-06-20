import { Params } from "@remix-run/react";
import { JobStatus } from "./enums";

export const kebabCase = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const getCurrentLocationWithoutParams = (
  path: string,
  params: Readonly<Params<string>>,
) => {
  let result = path;
  Object.keys(params).forEach((key) => {
    result = result.replace("/" + params[key] || "", "");
  });
  if (result[result.length - 1] !== "/") result = result + "/";
  return result;
};

export const isJobStatusTerminal = (curr: JobStatus) => {
  if (
    curr === JobStatus.PENDING ||
    curr === JobStatus.STARTED ||
    curr === JobStatus.ATTEMPT_FAILED
  ) {
    return false;
  }
  return true;
};

export const getFileName = (file: File) => {
  return file.name.split(".")[0] || "";
};

export const getFileTypesFromEnum = (enumOfTypes: object) => {
  return Object.keys(enumOfTypes);
};
