import { Params} from "@remix-run/react";

export const kebabCase = (str:string) => str
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .replace(/[\s_]+/g, '-')
  .toLowerCase();

export const getCurrentLocationWithoutParams = (
  path:string,
  params:Readonly<Params<string>>
)=>{
  let result = path;
  Object.keys(params).forEach((key)=>{
    result = result.replace(("/"+params[key]) || "", "")
  });
  if (result[result.length -1] !== "/") result = result + "/";
  return result;
}